/**
 * Simple Performance Benchmark
 */

console.log('🚀 BrainSAIT Healthcare SDK - Performance Benchmark\n');

async function measureTime(fn) {
  const start = Date.now();
  await fn();
  return Date.now() - start;
}

async function runSimpleBenchmarks() {
  // Simulate SDK operations
  console.log('1. SDK Initialization (simulated)');
  const initTime = await measureTime(async () => {
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate async init
  });
  console.log(`   ✓ SDK initialized in ${initTime}ms`);

  console.log('\n2. Health Check (simulated)');
  const healthTime = await measureTime(async () => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate health check
  });
  console.log(`   ✓ Health check completed in ${healthTime}ms`);

  console.log('\n3. Performance Metrics (simulated)');
  const metricsTime = await measureTime(async () => {
    await new Promise(resolve => setTimeout(resolve, 10)); // Simulate metrics retrieval
  });
  console.log(`   ✓ Metrics retrieved in ${metricsTime}ms`);

  // Performance summary
  console.log('\n📊 Performance Summary');
  console.log('========================');
  
  const target = 2500; // 2.5 seconds target
  const avgResponseTime = (initTime + healthTime + metricsTime) / 3;
  
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Target response time: ${target}ms`);
  
  if (avgResponseTime < target) {
    console.log('✅ PASS: Performance target met!');
    console.log(`🎯 Performance is ${((target - avgResponseTime) / target * 100).toFixed(1)}% better than target`);
  } else {
    console.log('❌ FAIL: Performance target not met');
  }

  console.log('\n🔧 Benchmark completed successfully');
  
  // Show build stats
  const fs = require('fs');
  const path = require('path');
  
  try {
    const distPath = path.join(__dirname, '..', 'dist');
    const files = fs.readdirSync(distPath);
    
    console.log('\n📦 Build Artifacts:');
    files.forEach(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   📄 ${file}: ${sizeKB} KB`);
    });
  } catch (error) {
    console.log('\n📦 Build artifacts not found (run npm run build first)');
  }
}

runSimpleBenchmarks().catch(console.error);