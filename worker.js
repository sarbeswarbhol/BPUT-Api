addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

const BASE_URL = "https://results.bput.ac.in";
const GITHUB_HTML_URL = "https://raw.githubusercontent.com/Arctixinc/BPUT-CheatCode/api/templates/index.html";

async function handleRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const params = new URLSearchParams(url.search);

    if (pathname === '/') {
        return handleHome();
    } else if (pathname === '/details') {
        return handleDetails(params);
    } else if (pathname === '/results') {
        return handleResults(params);
    } else if (pathname === '/examinfo') {
        return handleExamInfo(params);
    } else if (pathname === '/sgpa') {
        return handleSgpa(params);
    } else if (pathname === '/allsession') {
        return handleAllSession();
    } else {
        return new Response('Not Found', { status: 404 });
    }
}

async function handleHome() {
    try {
        const response = await fetch(GITHUB_HTML_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch HTML content');
        }
        const html = await response.text();
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        });
    } catch (error) {
        return new Response(`Error: ${error.message}`, {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function makeRequest(url, params, method = 'POST') {
    const requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: method === 'POST' ? params.toString() : undefined
    };

    try {
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        return data;
    } catch (error) {
        return { error: `Failed to retrieve data: ${error.message}` };
    }
}

function mapSessionCode(sessionCode) {
    const sessionMapping = {
        "S24": "Supplementary 2023-24",
        "E24": "Even-(2023-24)",
        "O24": "Odd-(2023-24)",
        "S23": "Supplementary 2022-23",
        "E23": "Even-(2022-23)",
        "O23": "Odd-(2022-23)",
        "S22": "Supplementary 2021-22",
        "R22": "Re-ExamOdd (2021-22)",
        "E22": "Even-(2021-22)",
        "O22": "Odd-(2021-22)",
        "S21": "Supplementary 2020-21",
        "E21": "Even-(2020-21)",
        "O21": "Odd-(2020-21)",
        "S20": "Supplementary 2019-20",
        "E20": "Even-(2019-20)",
        "O20": "Odd-(2019-20)",
        "S18": "Special (2018-19)",
        "E18": "Even-(2018-19)",
        "O18": "Odd-(2018-19)",
        "S17": "Special-(2017-18)",
        "E17": "Even-(2017-18)",
        "O17": "Odd-(2017-18)",
        "S16": "Special-(2016-17)",
        "E16": "Even-(2016-17)",
        "O16": "Odd-(2016-17)",
        "S15": "Special-(2015-16)",
        "E15": "Even-(2015-16)",
        "O15": "Odd-(2015-16)"
    };
    
    return sessionMapping[sessionCode] || sessionCode;
}

async function handleDetails(params) {
    const rollNo = params.get('rollno');
    if (!rollNo) {
        return new Response(JSON.stringify({ error: "rollno query parameter is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const url = `${BASE_URL}/student-detsils-results`;
    const result = await makeRequest(url, new URLSearchParams({ rollNo }));
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleResults(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = params.get('session') || 'E24';

    if (!rollNo) {
        return new Response(JSON.stringify({ error: "rollno query parameter is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    session = mapSessionCode(session);
    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });
    const url = `${BASE_URL}/student-results-subjects-list`;
    const result = await makeRequest(url, requestParams);

    const outputFormat = params.has('html') ? 'html' : 'json';

    if (outputFormat === 'html') {
        let htmlResponse = `
        <html>
        <head>
            <title>Student Results</title>
            <style>
                /* Add your CSS styles here */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f2f2f2;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
        
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
        
                th, td {
                    padding: 12px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
        
                th {
                    background-color: #4CAF50;
                    color: white;
                    text-transform: uppercase;
                }
        
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
        
                tr:hover {
                    background-color: #ddd;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <table>
                    <tr>
                        <th>S.No</th>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Type</th>
                        <th>Credits</th>
                        <th>Final Grade</th>
                    </tr>`;

        // Add table rows
        result.forEach((resultItem, index) => {
            htmlResponse += `
            <tr>
                <td>${index + 1}</td>
                <td>${resultItem['subjectCODE']}</td>
                <td>${resultItem['subjectName']}</td>
                <td>${resultItem['subjectTP']}</td>
                <td>${resultItem['subjectCredits']}</td>
                <td>${resultItem['grade']}</td>
            </tr>`;
        });

        htmlResponse += `
                </table>
            </div>
        </body>
        </html>`;

        return new Response(htmlResponse, {
            headers: { 'Content-Type': 'text/html' }
        });
    } else {
        // Return JSON response (default behavior)
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleExamInfo(params) {
    const rollNo = params.get('rollno');
    const dob = params.get('dob') || '2009-07-14';
    let session = params.get('session') || 'E24';

    if (!rollNo) {
        return new Response(JSON.stringify({ error: "rollno query parameter is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    session = mapSessionCode(session);
    const requestParams = new URLSearchParams({ rollNo, dob, session });
    const url = `${BASE_URL}/student-results-list`;
    const result = await makeRequest(url, requestParams);
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleSgpa(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = params.get('session') || 'E24';

    if (!rollNo) {
        return new Response(JSON.stringify({ error: "rollno query parameter is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    session = mapSessionCode(session);
    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });
    const url = `${BASE_URL}/student-results-sgpa`;
    const result = await makeRequest(url, requestParams);
    return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
    });
}

async function handleAllSession() {
    const url = "https://results.bput.ac.in/#";
    const response = await fetch(url);
    const html = await response.text();

    // Extract options using regex
    const regex = /<option[^>]*>([^<]*)<\/option>/g;
    let match;
    const sessions = [];
    while ((match = regex.exec(html)) !== null) {
        const sessionText = match[1].trim();
        if (sessionText !== 'Select Session') {
            sessions.push({ name: sessionText, shortCode: getShortCode(sessionText) });
        }
    }

    return new Response(JSON.stringify(sessions), {
        headers: { 'Content-Type': 'application/json' }
    });
}

function getShortCode(sessionName) {
    const shortCodeMapping = {
        "Supplementary 2023-24": "S24",
        "Even-(2023-24)": "E24",
        "Odd-(2023-24)": "O24",
        "Supplementary 2022-23": "S23",
        "Even-(2022-23)": "E23",
        "Odd-(2022-23)": "O23",
        "Supplementary 2021-22": "S22",
        "Re-ExamOdd (2021-22)": "R22",
        "Even-(2021-22)": "E22",
        "Odd-(2021-22)": "O22",
        "Supplementary 2020-21": "S21",
        "Even-(2020-21)": "E21",
        "Odd-(2020-21)": "O21",
        "Supplementary 2019-20": "S20",
        "Even-(2019-20)": "E20",
        "Odd-(2019-20)": "O20",
        "Special (2018-19)": "S18",
        "Even-(2018-19)": "E18",
        "Odd-(2018-19)": "O18",
        "Special-(2017-18)": "S17",
        "Even-(2017-18)": "E17",
        "Odd-(2017-18)": "O17",
        "Special-(2016-17)": "S16",
        "Even-(2016-17)": "E16",
        "Odd-(2016-17)": "O16",
        "Special-(2015-16)": "S15",
        "Even-(2015-16)": "E15",
        "Odd-(2015-16)": "O15"
    };
    return shortCodeMapping[sessionName] || sessionName;
}
