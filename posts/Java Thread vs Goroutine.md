---
date: 2026-04-21
tags:
  - 技术
summary: Java thread 对比 Go goroutine
---
## 1. 基础创建方式

**Java - Thread**
```java
// 方式1：继承 Thread 类
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Running in: " + Thread.currentThread().getName());
    }
}

MyThread t1 = new MyThread();
t1.start();  // 启动线程，OS 级线程，约 1MB 栈空间

// 方式2：实现 Runnable（推荐）
Thread t2 = new Thread(() -> {
    System.out.println("Lambda in: " + Thread.currentThread().getName());
});
t2.start();

// 方式3：Executor 线程池（生产环境标准）
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> {
    // 任务逻辑
});
```

**Go - Goroutine**
```go
// 直接 go 关键字启动，用户态轻量级线程，2KB 初始栈（可动态增长）
go func() {
    fmt.Println("Running in goroutine")
}()

// 带匿名函数和闭包
go func(msg string) {
    fmt.Println("Message:", msg)
}("hello")

// 生产环境通常配合 channel 或 sync.WaitGroup
var wg sync.WaitGroup
wg.Add(1)
go func() {
    defer wg.Done()
    // 任务逻辑
}()
wg.Wait()
```

## 2. 通信机制对比（核心差异）

**Java - 共享内存 + 锁（传统模型）**
```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class JavaConcurrency {
    // 共享变量需要同步
    private static int counter = 0;
    private static final Object lock = new Object();
    
    // 或者使用原子类
    private static AtomicInteger atomicCounter = new AtomicInteger(0);
    
    public static void main(String[] args) throws InterruptedException {
        // 线程间通信：共享内存 + synchronized/lock
        BlockingQueue<String> queue = new LinkedBlockingQueue<>();
        
        Thread producer = new Thread(() -> {
            try {
                synchronized (lock) {
                    queue.put("data");
                    counter++;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        Thread consumer = new Thread(() -> {
            try {
                String data = queue.take();  // 阻塞等待
                synchronized (lock) {
                    System.out.println("Received: " + data + ", counter: " + counter);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });
        
        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}
```

**Go - CSP 模型：Channel（推荐"通过通信共享内存"）**
```go
package main

import (
	"fmt"
	"time"
)

func main() {
	// 无缓冲 channel（同步通信）
	ch := make(chan string)
	
	// 有缓冲 channel（异步，容量3）
	bufferedCh := make(chan string, 3)
	
	// Goroutine 1: 生产者
	go func() {
		// 直接发送，无需显式锁
		ch <- "data from goroutine"
		close(ch) // 关闭 channel 表示无更多数据
	}()
	
	// Goroutine 2: 消费者
	go func() {
		// 接收数据，阻塞等待直到有数据
		for msg := range ch {
			fmt.Println("Received:", msg)
		}
	}()
	
	// 多路复用（类似 Java NIO Selector，但语法更简洁）
	select {
	case msg1 := <-ch:
		fmt.Println("Got from ch:", msg1)
	case msg2 := <-bufferedCh:
		fmt.Println("Got from buffered:", msg2)
	case <-time.After(1 * time.Second):
		fmt.Println("Timeout!")
	default: // 非阻塞尝试
		fmt.Println("No data available")
	}
	
	time.Sleep(100 * time.Millisecond)
}
```

## 3. 完整实战对比：并发下载任务

**Java 版本 - 使用 CompletableFuture（现代 Java 推荐）**
```java
import java.util.*;
import java.util.concurrent.*;

public class ConcurrentDownload {
    private static final HttpClient client = HttpClient.newHttpClient();
    
    public static void main(String[] args) {
        List<String> urls = Arrays.asList(
            "https://api1.example.com",
            "https://api2.example.com",
            "https://api3.example.com"
        );
        
        // 创建固定线程池
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // 使用传统for循环创建Future列表
        List<CompletableFuture<String>> futures = new ArrayList<>();
        for (String url : urls) {
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                // 模拟下载，实际使用HttpClient
                try {
                    Thread.sleep(100); // 模拟IO
                    return "Downloaded: " + url + " by " + Thread.currentThread().getName();
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }, executor);
            futures.add(future);
        }
        
        // 转换为数组用于allOf方法
        CompletableFuture<?>[] futureArray = new CompletableFuture[futures.size()];
        for (int i = 0; i < futures.size(); i++) {
            futureArray[i] = futures.get(i);
        }
        
        // 等待所有完成并收集结果
        CompletableFuture.allOf(futureArray).thenRun(() -> {
            // 使用传统for循环打印结果
            for (CompletableFuture<String> future : futures) {
                try {
                    System.out.println(future.get());
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).join();
        
        executor.shutdown();
    }
}
```

**Go 版本 - 使用 Goroutine + Channel**
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// 模拟下载函数
func download(url string, wg *sync.WaitGroup, resultChan chan<- string) {
	defer wg.Done()
	
	// 模拟 IO 操作（Goroutine 在等待时会让出 CPU）
	time.Sleep(100 * time.Millisecond)
	
	// 直接通过 channel 发送结果，无需共享变量
	resultChan <- fmt.Sprintf("Downloaded: %s by goroutine", url)
}

func main() {
	urls := []string{
		"https://api1.example.com",
		"https://api2.example.com",
		"https://api3.example.com",
	}
	
	// WaitGroup 等待所有 Goroutine 完成
	var wg sync.WaitGroup
	
	// Channel 用于收集结果（带缓冲，避免阻塞）
	resultChan := make(chan string, len(urls))
	
	// 启动成千上万个 Goroutine 也轻松（每个仅 2KB 栈）
	for _, url := range urls {
		wg.Add(1)
		go download(url, &wg, resultChan) // 轻量！
	}
	
	// 另起 Goroutine 关闭 channel
	go func() {
		wg.Wait()
		close(resultChan)
	}()
	
	// 遍历 channel 接收结果（range 自动处理关闭信号）
	for result := range resultChan {
		fmt.Println(result)
	}
	
	// 对比：Go 可以轻松启动 10万+ Goroutine
	// Java 线程通常限制在几千个（受内存限制）
	demoMassiveGoroutines()
}

func demoMassiveGoroutines() {
	fmt.Println("\n启动 10 万个 Goroutine 演示：")
	var wg sync.WaitGroup
	start := time.Now()
	
	for i := 0; i < 100000; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			// 空任务，仅展示调度能力
			_ = id * 2
		}(i)
	}
	
	wg.Wait()
	fmt.Printf("10万 Goroutine 完成，耗时: %v\n", time.Since(start))
	// 输出：约 200-500ms，内存占用约 200MB
	// Java 启动 10万 Thread 会导致 OOM（需要 100GB+ 内存）
}
```

## 4. 同步原语对比

| 场景 | Java | Go |
|------|------|-----|
| **互斥锁** | `synchronized` / `ReentrantLock` | `sync.Mutex` |
| **读写锁** | `ReadWriteLock` | `sync.RWMutex` |
| **等待组** | `CountDownLatch` / `Phaser` | `sync.WaitGroup` |
| **原子操作** | `AtomicInteger` 等 | `sync/atomic` 包 |
| **条件变量** | `Condition` | `sync.Cond` |
| **单次执行** | 无原生 | `sync.Once` |

**Java 锁示例：**
```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class JavaLocks {
    private final ReentrantLock lock = new ReentrantLock();
    private final ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
    private int value = 0;
    
    public void write() {
        lock.lock();  // 显式获取
        try {
            value++;
        } finally {
            lock.unlock(); // 必须在 finally 释放
        }
    }
    
    public int read() {
        rwLock.readLock().lock();
        try {
            return value;
        } finally {
            rwLock.readLock().unlock();
        }
    }
}
```

**Go 锁示例：**
```go
package main

import "sync"

type SafeCounter struct {
	mu    sync.RWMutex  // 零值可用，无需初始化
	value int
}

func (c *SafeCounter) Inc() {
	c.mu.Lock()         // 显式锁
	defer c.mu.Unlock() // defer 确保释放，更简洁
	c.value++
}

func (c *SafeCounter) Value() int {
	c.mu.RLock()         // 读锁
	defer c.mu.RUnlock()
	return c.value
}

// 更 Go 风格：用 channel 替代锁（避免共享）
type ChannelCounter struct {
	ch chan int // 通过 channel 串行化访问
}

func NewChannelCounter() *ChannelCounter {
	c := &ChannelCounter{ch: make(chan int, 1)}
	c.ch <- 0 // 初始值
	return c
}

func (c *ChannelCounter) Inc() {
	val := <-c.ch
	c.ch <- val + 1
}

func (c *ChannelCounter) Value() int {
	val := <-c.ch
	c.ch <- val
	return val
}
```

## 5. 关键差异总结

| 特性 | Java Thread | Go Goroutine |
|------|-------------|--------------|
| **调度** | OS 内核调度（重量级） | Go 运行时调度（M:N 模型，轻量） |
| **栈大小** | 固定 1MB（64位 JVM） | 初始 2KB，动态增长/收缩 |
| **创建成本** | 高（需 OS 资源） | 极低（用户态，约 2-3 个函数调用） |
| **切换成本** | 高（内核态切换） | 低（用户态切换，约 200ns） |
| **并发规模** | 通常几千个 | 轻松 10万+ 个 |
| **通信方式** | 共享内存 + 锁（复杂） | Channel（推荐）或共享内存 |
| **错误处理** | try-catch，跨线程困难 | 每个 Goroutine 独立 panic/recover |
| **取消机制** | `interrupt()` + 检查标志 | `context.Context`（标准且强大） |

## 6. 何时选择什么？

**选择 Java 并发当：**
- 需要与遗留 Java 代码集成
- 复杂的企业级事务管理（JTA）
- 需要成熟的生态（Spring 等框架）
- 计算密集型任务（JVM 优化成熟）

**选择 Go 并发当：**
- 高并发网络服务（IO 密集型）
- 需要管理大量并发连接（WebSocket、API 网关）
- 微服务架构（编译单二进制，部署简单）
- 需要简洁的并发代码（CSP 模型直观）

Go 的 Goroutine 和 Channel 设计让并发编程变得**声明式且安全**，而 Java 的 Thread 模型更**底层且灵活**，但需要更多样板代码来确保线程安全。