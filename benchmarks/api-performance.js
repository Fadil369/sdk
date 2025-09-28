/**
 * API Performance Benchmarks - Simple JavaScript version
 * Target: <2.5s API response times
 */

const { BrainSAITHealthcareSDK } = require('../dist/index.umd.js');

async function measureAsyncTime(fn) {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  return [result, end - start];
}

async function runBenchmarks() {
  console.log('🚀 Starting API Performance Benchmarks...\n');

  const sdk = new BrainSAITHealthcareSDK({
    api: {
      baseUrl: 'https://httpbin.org',
      timeout: 30000,
      retries: 1,
    },
    fhir: {
      serverUrl: 'https://hapi.fhir.org/baseR4',
      version: 'R4',
    },
    nphies: {
      baseUrl: 'https://httpbin.org',
      clientId: 'test-client',
      scope: ['read'],
      sandbox: true,
    },
  });

  try {
    // Test SDK initialization time
    console.log('1. SDK Initialization Performance');
    const [, initTime] = await measureAsyncTime(async () => {
      await sdk.initialize();
    });
    console.log(`   ✓ SDK initialized in ${initTime.toFixed(2)}ms`);
    
    // Test health check response time
    console.log('\n2. Health Check Performance');
    const [healthResult, healthTime] = await measureAsyncTime(async () => {
      return await sdk.healthCheck();
    });
    console.log(`   ✓ Health check completed in ${healthTime.toFixed(2)}ms`);
    console.log(`   ✓ Status: ${healthResult.status}`);

    // Test performance metrics retrieval
    console.log('\n3. Performance Metrics Retrieval');
    const [metrics, metricsTime] = await measureAsyncTime(async () => {
      return sdk.getPerformanceMetrics();
    });
    console.log(`   ✓ Metrics retrieved in ${metricsTime.toFixed(2)}ms`);
    console.log(`   ✓ Current API response time: ${metrics.apiResponseTime.toFixed(2)}ms`);
    console.log(`   ✓ Current UI frame rate: ${metrics.uiFrameRate}fps`);
    console.log(`   ✓ Memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);

    // Performance summary
    console.log('\n📊 Performance Summary');
    console.log('========================');
    
    const target = 2500; // 2.5 seconds target
    const avgResponseTime = (initTime + healthTime + metricsTime) / 3;
    
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Target response time: ${target}ms`);
    
    if (avgResponseTime < target) {
      console.log('✅ PASS: Performance target met!');
    } else {
      console.log('❌ FAIL: Performance target not met');
    }

    // Cleanup
    await sdk.shutdown();
    console.log('\n🔧 SDK shutdown completed');
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error.message);
    process.exit(1);
  }
}

// Run benchmarks
runBenchmarks().catch(console.error);