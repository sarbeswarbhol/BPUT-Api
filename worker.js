// Global Constants
const BASE_URL = "https://results.bput.ac.in";
const GITHUB_HTML_URL = "https://raw.githubusercontent.com/Arctixinc/BPUT-CheatCode/api/templates/index.html";
const SESSION_MAPPING = {
    "O25": "Odd-(2024-25)", "S24": "Supplementary 2023-24", "E24": "Even-(2023-24)", "O24": "Odd-(2023-24)",
    "S23": "Supplementary 2022-23", "E23": "Even-(2022-23)", "O23": "Odd-(2022-23)", "S22": "Supplementary 2021-22",
    "R22": "Re-ExamOdd (2021-22)", "E22": "Even-(2021-22)", "O22": "Odd-(2021-22)", "S21": "Supplementary 2020-21",
    "E21": "Even-(2020-21)", "O21": "Odd-(2020-21)", "S20": "Supplementary 2019-20", "E20": "Even-(2019-20)",
    "O20": "Odd-(2019-20)", "S18": "Special (2018-19)", "E18": "Even-(2018-19)", "O18": "Odd-(2018-19)",
    "S17": "Special-(2017-18)", "E17": "Even-(2017-18)", "O17": "Odd-(2017-18)", "S16": "Special-(2016-17)",
    "E16": "Even-(2016-17)", "O16": "Odd-(2016-17)", "S15": "Special-(2015-16)", "E15": "Even-(2015-16)", "O15": "Odd-(2015-16)"
};
const SHORT_CODE_MAPPING = Object.fromEntries(
    Object.entries(SESSION_MAPPING).map(([key, value]) => [value, key])
);

// Event Listener
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Request Router
async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const params = new URLSearchParams(url.search);

    switch (pathname) {
        case '/':
            return handleHome();
        case '/details':
            return handleDetails(params);
        case '/results':
            return handleResults(params);
        case '/examinfo':
            return handleExamInfo(params);
        case '/sgpa':
            return handleSgpa(params);
        case '/allsession':
            return handleAllSession();
        default:
            return new Response('Not Found', { status: 404 });
    }
}

// Home Handler
async function handleHome() {
    try {
        const response = await fetch(GITHUB_HTML_URL);
        if (!response.ok) throw new Error('Failed to fetch HTML content');

        const html = await response.text();
        return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    } catch (error) {
        return errorResponse(500, error.message);
    }
}

// Utility Functions
function errorResponse(status, message) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function mapSessionCode(sessionCode) {
    return SESSION_MAPPING[sessionCode] || sessionCode;
}

async function makeRequest(url, params, method = 'POST') {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: method === 'POST' ? params.toString() : undefined
        };
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        return { error: `Failed to retrieve data: ${error.message}` };
    }
}

// Handlers for API Endpoints
async function handleDetails(params) {
    const rollNo = params.get('rollno');
    if (!rollNo) return errorResponse(400, 'rollno query parameter is required');

    const url = `${BASE_URL}/student-detsils-results`;
    const result = await makeRequest(url, new URLSearchParams({ rollNo }));
    return jsonResponse(result);
}

async function handleResults(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = mapSessionCode(params.get('session') || 'E24');

    if (!rollNo) return errorResponse(400, 'rollno query parameter is required');

    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });
    const url = `${BASE_URL}/student-results-subjects-list`;
    const result = await makeRequest(url, requestParams);

    return params.has('html') ? htmlResponse(result) : jsonResponse(result);
}

async function handleExamInfo(params) {
    const rollNo = params.get('rollno');
    const dob = params.get('dob') || '2009-07-14';
    let session = mapSessionCode(params.get('session') || 'E24');

    if (!rollNo) return errorResponse(400, 'rollno query parameter is required');

    const requestParams = new URLSearchParams({ rollNo, dob, session });
    const url = `${BASE_URL}/student-results-list`;
    const result = await makeRequest(url, requestParams);
    return jsonResponse(result);
}

async function handleSgpa(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = mapSessionCode(params.get('session') || 'E24');

    if (!rollNo) return errorResponse(400, 'rollno query parameter is required');

    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });
    const url = `${BASE_URL}/student-results-sgpa`;
    const result = await makeRequest(url, requestParams);
    return jsonResponse(result);
}

async function handleAllSession() {
    const url = `${BASE_URL}/#`;
    const response = await fetch(url);
    const html = await response.text();

    const sessions = Array.from(html.matchAll(/<option[^>]*>([^<]*)<\/option>/g))
        .map(match => match[1].trim())
        .filter(sessionText => sessionText !== 'Select Session')
        .map(sessionText => ({ name: sessionText, shortCode: SHORT_CODE_MAPPING[sessionText] || sessionText }));

    return jsonResponse(sessions);
}

// Response Utilities
function jsonResponse(data) {
    return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
}

function htmlResponse(results) {
    let html = `
    <html>
    <head>
        <title>Student Results</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0; }
            .container { max-width: 800px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #4CAF50; color: white; text-transform: uppercase; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            tr:hover { background-color: #ddd; }
        </style>
    </head>
    <body>
        <div class="container">
            <table>
                <tr><th>S.No</th><th>Subject Code</th><th>Subject Name</th><th>Type</th><th>Credits</th><th>Final Grade</th></tr>`;

    results.forEach((item, index) => {
        html += `<tr><td>${index + 1}</td><td>${item.subjectCODE}</td><td>${item.subjectName}</td><td>${item.subjectTP}</td><td>${item.subjectCredits}</td><td>${item.grade}</td></tr>`;
    });

    html += `</table></div></body></html>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
