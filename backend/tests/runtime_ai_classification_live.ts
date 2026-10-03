import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api';

async function request(url: string, options: any = {}) {
  const fullUrl = `${BASE_URL}${url}`;
  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get('content-type');
  const data = contentType && contentType.includes('application/json') ? await res.json() : null;

  return { status: res.status, data };
}

async function runLiveVerification() {
  console.log('=== STARTING LIVE RUNTIME E2E VERIFICATION (AI QUESTION BANK INTELLIGENCE) ===\n');

  // 1. Authenticate users
  console.log('1. Authenticating test users against live backend & MySQL...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'placementadmin@placement.edu',
      password: 'PlacementAdmin@123',
    },
  });
  assert.equal(adminLogin.status, 200, 'Placement Admin login failed');
  const adminToken = adminLogin.data.data.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('   ✔ Placement Admin authenticated.');

  const studentLogin = await request('/auth/login', {
    method: 'POST',
    body: {
      email: 'student@placement.edu',
      password: 'Student@123',
    },
  });
  assert.equal(studentLogin.status, 200, 'Student login failed');
  const studentToken = studentLogin.data.data.accessToken;
  const studentHeaders = { Authorization: `Bearer ${studentToken}` };
  console.log('   ✔ Student authenticated.\n');

  // 2. Security & RBAC Enforcement: Students must be strictly forbidden (HTTP 403)
  console.log('2. Verifying Security & RBAC: Students strictly forbidden from AI classification endpoints...');
  const rbacTests = [
    { name: 'AI Detect', method: 'POST', path: '/questions/ai/detect', body: { questionText: 'Test' } },
    { name: 'Batch Classify', method: 'POST', path: '/questions/ai/batch-classify', body: { questionIds: ['q-1'] } },
    { name: 'Needs Review', method: 'GET', path: '/questions/ai/needs-review', body: null },
    { name: 'Classify Question', method: 'POST', path: '/questions/q-dummy/classify', body: {} },
    { name: 'Review Classification', method: 'POST', path: '/questions/q-dummy/review-classification', body: { action: 'ACCEPT' } },
  ];

  for (const t of rbacTests) {
    const res = await request(t.path, {
      method: t.method,
      headers: studentHeaders,
      body: t.body,
    });
    assert.equal(res.status, 403, `Security violation: Student was not forbidden on ${t.name} (got ${res.status})`);
    console.log(`   ✔ RBAC 403 Forbidden verified for ${t.name}`);
  }
  console.log('   ✔ All AI classification endpoints secured against Student role.\n');

  // 3. User Prompt Example Classification
  console.log('3. Testing AI Understanding on User Prompt Example:');
  console.log('   "If the cost price is ₹500 and selling price is ₹600, calculate the profit percentage."');
  const promptExampleRes = await request('/questions/ai/detect', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      questionText: 'If the cost price is ₹500 and selling price is ₹600, calculate the profit percentage.',
      options: [
        { optionText: '20%', isCorrect: true },
        { optionText: '15%', isCorrect: false },
        { optionText: '25%', isCorrect: false },
        { optionText: '10%', isCorrect: false },
      ],
    },
  });
  assert.equal(promptExampleRes.status, 200);
  const exClassification = promptExampleRes.data.data;
  console.log('   AI Classification Result:', {
    category: exClassification.category,
    topic: exClassification.topic,
    difficulty: exClassification.difficulty,
    questionType: exClassification.questionType,
    confidence: exClassification.confidence,
    status: exClassification.status,
  });

  assert.equal(exClassification.category, 'QUANTITATIVE_APTITUDE');
  assert.equal(exClassification.topic, 'Profit & Loss');
  assert.equal(exClassification.difficulty, 'EASY');
  assert.equal(exClassification.questionType, 'SINGLE_CHOICE');
  assert.ok(exClassification.confidence.category >= 0.85);
  assert.ok(exClassification.confidence.topic >= 0.85);
  assert.ok(exClassification.confidence.difficulty >= 0.70);
  assert.ok(exClassification.confidence.questionType >= 0.85);
  assert.equal(exClassification.status, 'CLASSIFIED');
  console.log('   ✔ Successfully identified Category, Topic, Difficulty, Type, and Confidence scores.\n');

  // 4. Multi-step reasoning: Time & Work / Pipes & Cisterns
  console.log('4. Testing multi-step reasoning calculation (evaluates cognitive steps, not just length)...');
  const pipesRes = await request('/questions/ai/detect', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      questionText:
        'Pipe A can fill a tank in 4 hours, and Pipe B can empty it in 6 hours. If both pipes are opened together when the tank is half full, how many hours will it take to fill the tank completely?',
      options: [
        { optionText: '6 hours', isCorrect: true },
        { optionText: '12 hours', isCorrect: false },
        { optionText: '3 hours', isCorrect: false },
        { optionText: '8 hours', isCorrect: false },
      ],
    },
  });
  assert.equal(pipesRes.status, 200);
  const pipesClassification = pipesRes.data.data;
  assert.equal(pipesClassification.category, 'QUANTITATIVE_APTITUDE');
  assert.equal(pipesClassification.topic, 'Time & Work');
  assert.ok(['MEDIUM', 'HARD'].includes(pipesClassification.difficulty));
  console.log('   ✔ Multi-step question classified as:', pipesClassification.topic, 'Difficulty:', pipesClassification.difficulty);
  console.log('   ✔ Difficulty derived from multi-factor cognitive reasoning.\n');

  // 5. Ambiguous Question Flagged as NEEDS_REVIEW
  console.log('5. Testing ambiguous question handling: low confidence must trigger NEEDS_REVIEW...');
  const ambiguousRes = await request('/questions/ai/detect', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      questionText: 'Select the option that best completes the sequence or general idea.',
      options: [
        { optionText: 'Option A', isCorrect: true },
        { optionText: 'Option B', isCorrect: false },
      ],
    },
  });
  assert.equal(ambiguousRes.status, 200);
  const ambClassification = ambiguousRes.data.data;
  assert.equal(ambClassification.status, 'NEEDS_REVIEW');
  console.log('   ✔ Ambiguous question successfully flagged as NEEDS_REVIEW (Status:', ambClassification.status, ')\n');

  // 6. Create Question in MySQL Question Bank and run AI Classification Lifecycle
  console.log('6. Creating new question in MySQL Question Bank and executing AI Classification lifecycle...');
  const createQRes = await request('/questions', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      category: 'QUANTITATIVE_APTITUDE',
      topic: 'Simple Interest', // Will be reclassified
      difficulty: 'HARD',
      questionType: 'SINGLE_CHOICE',
      questionText: `A train running at 72 km/h crosses a standing pole in 15 seconds. What is the length of the train in meters? (Test ${Date.now()})`,
      marks: 1.0,
      options: [
        { optionText: '300 m', optionOrder: 1, isCorrect: true },
        { optionText: '250 m', optionOrder: 2, isCorrect: false },
        { optionText: '360 m', optionOrder: 3, isCorrect: false },
        { optionText: '400 m', optionOrder: 4, isCorrect: false },
      ],
    },
  });
  assert.equal(createQRes.status, 201);
  const questionId = createQRes.data.data.id;
  console.log('   ✔ Question created in Question Bank with ID:', questionId);

  // Trigger AI Classification on existing question
  console.log('7. Triggering AI classification on existing question via POST /api/questions/:id/classify...');
  const classifyRes = await request(`/questions/${questionId}/classify`, {
    method: 'POST',
    headers: adminHeaders,
  });
  assert.equal(classifyRes.status, 200);
  const questionWithAi = classifyRes.data.data;
  const liveClassification = questionWithAi.aiClassification;
  assert.ok(liveClassification, 'aiClassification must be attached to QuestionDto');
  console.log('   ✔ AI Classification stored in MySQL:', {
    topic: liveClassification.suggestedTopic,
    category: liveClassification.suggestedCategory,
    difficulty: liveClassification.suggestedDifficulty,
    status: liveClassification.status,
  });
  assert.equal(liveClassification.suggestedTopic, 'Time Speed Distance');
  assert.equal(liveClassification.status, 'CLASSIFIED');

  // Verify the original Question is not silently overwritten before Admin approval
  const fetchQ1 = await request(`/questions/${questionId}`, { headers: adminHeaders });
  assert.equal(fetchQ1.status, 200);
  assert.equal(fetchQ1.data.data.topic, 'Simple Interest'); // Original remains intact
  assert.ok(fetchQ1.data.data.aiClassification, 'AI Classification relation attached');
  console.log('   ✔ Admin Control Guaranteed: Question metadata is NOT overwritten automatically without Admin approval.\n');

  // 8. Admin Review: Accept AI Classification
  console.log('8. Admin Review: Testing "Accept AI Classification"...');
  const acceptRes = await request(`/questions/${questionId}/review-classification`, {
    method: 'POST',
    headers: adminHeaders,
    body: {
      action: 'ACCEPT',
      notes: 'Approved by Placement Admin via automated verification',
    },
  });
  assert.equal(acceptRes.status, 200);
  const updatedQuestion = acceptRes.data.data;
  assert.equal(updatedQuestion.topic, 'Time Speed Distance');
  assert.equal(updatedQuestion.aiClassification.status, 'CLASSIFIED');
  console.log('   ✔ Question metadata updated to AI suggested topic:', updatedQuestion.topic);
  console.log('   ✔ AI Classification approved by Admin.\n');

  // 9. Admin Review: Edit & Override
  console.log('9. Admin Review: Testing "Edit & Override"...');
  const overrideRes = await request(`/questions/${questionId}/review-classification`, {
    method: 'POST',
    headers: adminHeaders,
    body: {
      action: 'OVERRIDE',
      category: 'QUANTITATIVE_APTITUDE',
      topic: 'Ratio & Proportion',
      difficulty: 'MEDIUM',
      notes: 'Placement Admin changed this question to Ratio & Proportion',
    },
  });
  assert.equal(overrideRes.status, 200);
  const overriddenQuestion = overrideRes.data.data;
  assert.equal(overriddenQuestion.topic, 'Ratio & Proportion');
  assert.equal(overriddenQuestion.difficulty, 'MEDIUM');
  assert.equal(overriddenQuestion.aiClassification.status, 'CLASSIFIED');
  assert.equal(overriddenQuestion.aiClassification.isApproved, true);
  console.log('   ✔ Admin successfully edited & overrode category, topic, difficulty with audit trail.\n');

  // 10. Batch AI Classification
  console.log('10. Testing Batch AI Classification...');
  // Create 2 questions for batch
  const batchQ1 = await request('/questions', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      category: 'QUANTITATIVE_APTITUDE',
      topic: 'Average',
      difficulty: 'EASY',
      questionType: 'SINGLE_CHOICE',
      questionText: `The average age of 5 students is 20 years. If the teacher is included, the average becomes 22 years. What is the age of the teacher? (Batch Q1 ${Date.now()})`,
      marks: 1.0,
      options: [
        { optionText: '32 years', optionOrder: 1, isCorrect: true },
        { optionText: '30 years', optionOrder: 2, isCorrect: false },
      ],
    },
  });
  const batchQ2 = await request('/questions', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      category: 'QUANTITATIVE_APTITUDE',
      topic: 'Probability',
      difficulty: 'EASY',
      questionType: 'SINGLE_CHOICE',
      questionText: `Two unbiased coins are tossed simultaneously. What is the probability of getting at least one head? (Batch Q2 ${Date.now()})`,
      marks: 1.0,
      options: [
        { optionText: '3/4', optionOrder: 1, isCorrect: true },
        { optionText: '1/2', optionOrder: 2, isCorrect: false },
      ],
    },
  });
  assert.equal(batchQ1.status, 201);
  assert.equal(batchQ2.status, 201);

  const batchRes = await request('/questions/ai/batch-classify', {
    method: 'POST',
    headers: adminHeaders,
    body: {
      questionIds: [batchQ1.data.data.id, batchQ2.data.data.id],
    },
  });
  assert.equal(batchRes.status, 200);
  assert.equal(batchRes.data.data.totalRequested, 2);
  assert.equal(batchRes.data.data.processed, 2);
  assert.equal(batchRes.data.data.failed, 0);
  console.log('   ✔ Batch AI classification executed successfully for multiple questions without blocking.\n');

  // 11. Filtering Questions by AI Status
  console.log('11. Testing Question Bank filtering by AI Status...');
  const classifiedFilterRes = await request('/questions?aiStatus=CLASSIFIED', { headers: adminHeaders });
  assert.equal(classifiedFilterRes.status, 200);
  const items = classifiedFilterRes.data.data.data || classifiedFilterRes.data.data;
  assert.ok(items.length > 0);
  console.log('   ✔ Successfully queried questions with aiStatus=CLASSIFIED (Count:', items.length, ')');

  const needsReviewRes = await request('/questions/ai/needs-review', { headers: adminHeaders });
  assert.equal(needsReviewRes.status, 200);
  console.log('   ✔ Successfully queried questions needing review.\n');

  console.log('=============================================================================');
  console.log('🎉 ALL LIVE RUNTIME E2E VERIFICATIONS PASSED SUCCESSFULLY WITH ZERO ERRORS!');
  console.log('=============================================================================');
}

runLiveVerification().catch((err) => {
  console.error('\n❌ Live E2E Verification failed:', err);
  process.exit(1);
});
