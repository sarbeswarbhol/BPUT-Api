// Global Constants
const BASE_URL = "https://results.bput.ac.in";
// const FALLBACK_URL = "http://results.bput.co.in"; // Uncomment to enable fallback
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
const ROLL_NO_REGEX = /^[A-Za-z0-9]{10,12}$/; // Regex to validate roll numbers

// Event listener for incoming requests
addEventListener('fetch', (event) => {
    event.respondWith(router(event.request, event));
});

/**
 * Main router function
 * @param {Request} request
 * @param {Event} event
 */
async function router(request, event) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    switch (pathname) {
        case '/':
            return handleHome();
        case '/details':
            return handleDetails(url.searchParams);
        case '/results':
            return handleResults(url.searchParams);
        case '/examinfo':
            return handleExamInfo(url.searchParams);
        case '/sgpa':
            return handleSgpa(url.searchParams);
        case '/allsession':
            return handleAllSession(event);
        case '/combined':
            return handleCombinedRequest(request);
        default:
            return new Response('Not Found', { status: 404 });
    }
}

/**
 * Fetches query parameters from the URL
 * @param {string} url
 */
function getQueryParams(url) {
    const queryParams = {};
    const urlObj = new URL(url);

    for (const [key, value] of urlObj.searchParams) {
        queryParams[key] = value;
    }

    return queryParams;
}

/**
 * Sends a JSON error response
 * @param {number} status
 * @param {string} message
 */
function errorResponse(status, message) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Sends a JSON response
 * @param {Object} data
 */
function jsonResponse(data) {
    return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Makes a POST request to the specified URL
 * @param {string} url
 * @param {URLSearchParams} params
 * @param {string} method
 */
async function makeRequest(url, params, method = 'POST') {
    const options = {
        method,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: method === 'POST' ? params.toString() : undefined
    };

    try {
        let response = await fetch(url, options);

        // Uncomment below to enable fallback URL
        // if (!response.ok && url.startsWith(BASE_URL)) {
        //     const fallbackUrl = url.replace(BASE_URL, FALLBACK_URL);
        //     response = await fetch(fallbackUrl, options);
        // }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            return await response.json();
        } else {
            throw new Error('Unexpected response format: Expected JSON');
        }
    } catch (error) {
        console.error(`Request to ${url} failed:`, error);
        return { error: error.message };
    }
}

/**
 * Handles the home route
 */
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

/**
 * Handles the details route
 * @param {URLSearchParams} params
 */
async function handleDetails(params) {
    const rollNo = params.get('rollno');
    if (!rollNo) return errorResponse(400, 'rollno parameter is required');
    if (!ROLL_NO_REGEX.test(rollNo)) return errorResponse(400, 'Invalid roll number format');

    const result = await makeRequest(`${BASE_URL}/student-detsils-results`, new URLSearchParams({ rollNo }));
    return result.error ? errorResponse(500, result.error) : jsonResponse(result);
}

/**
 * Handles the results route
 * @param {URLSearchParams} params
 */
async function handleResults(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = SESSION_MAPPING[params.get('session')] || params.get('session') || 'E24';

    if (!rollNo) return errorResponse(400, 'rollno parameter is required');
    if (!ROLL_NO_REGEX.test(rollNo)) return errorResponse(400, 'Invalid roll number format');

    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });

    // Fetch student details, subject results, and SGPA
    const [details, results, sgpaDetails] = await Promise.all([
        makeRequest(`${BASE_URL}/student-detsils-results`, new URLSearchParams({ rollNo })),
        makeRequest(`${BASE_URL}/student-results-subjects-list`, requestParams),
        makeRequest(`${BASE_URL}/student-results-sgpa`, requestParams)
    ]);

    // console.log(details);
    // console.log(results);

    if (params.has('html')) {
        return htmlResponse(details, results, sgpaDetails);
    } else {
        return jsonResponse({ details, results, sgpaDetails });
    }
}

/**
 * Handles the exam info route
 * @param {URLSearchParams} params
 */
async function handleExamInfo(params) {
    const rollNo = params.get('rollno');
    const dob = params.get('dob') || '2009-07-14';
    let session = SESSION_MAPPING[params.get('session')] || params.get('session') || 'E24';

    if (!rollNo) return errorResponse(400, 'rollno parameter is required');
    if (!ROLL_NO_REGEX.test(rollNo)) return errorResponse(400, 'Invalid roll number format');

    const requestParams = new URLSearchParams({ rollNo, dob, session });
    const result = await makeRequest(`${BASE_URL}/student-results-list`, requestParams);
    return jsonResponse(result);
}

/**
 * Handles the SGPA route
 * @param {URLSearchParams} params
 */
async function handleSgpa(params) {
    const rollNo = params.get('rollno');
    const semId = params.get('semid') || '4';
    let session = SESSION_MAPPING[params.get('session')] || params.get('session') || 'E24';

    if (!rollNo) return errorResponse(400, 'rollno parameter is required');
    if (!ROLL_NO_REGEX.test(rollNo)) return errorResponse(400, 'Invalid roll number format');

    const requestParams = new URLSearchParams({ rollNo, semid: semId, session });
    const result = await makeRequest(`${BASE_URL}/student-results-sgpa`, requestParams);
    return jsonResponse(result);
}

/**
 * Handles the all session route with caching
 * @param {Event} event
 */
async function handleAllSession(event) {
    const cacheKey = new Request(`${BASE_URL}/sessions`);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (response) {
        console.log('Serving cached session list');
        return response;
    }

    try {
        const response = await fetch(BASE_URL);
        const html = await response.text();
        const sessions = Array.from(html.matchAll(/<option[^>]*>([^<]*)<\/option>/g))
            .map(match => match[1].trim())
            .filter(text => text !== 'Select Session')
            .map(text => ({ 
                name: text, 
                shortCode: SHORT_CODE_MAPPING[text] || text 
            }));

        const jsonResponse = new Response(JSON.stringify(sessions), {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=86400' // 24-hour cache
            }
        });

        event.waitUntil(cache.put(cacheKey, jsonResponse.clone()));
        return jsonResponse;
    } catch (error) {
        return errorResponse(500, "Failed to retrieve session list");
    }
}

/**
 * Handles the combined request route with parallel execution
 * @param {Request} request
 */
async function handleCombinedRequest(request) {
    const { rollNo, semid, session } = getQueryParams(request.url);

    if (!rollNo || !semid || !session) {
        return errorResponse(400, "Missing required parameters: rollNo, semid, session");
    }

    if (!ROLL_NO_REGEX.test(rollNo)) {
        return errorResponse(400, "Invalid roll number format");
    }

    const fullSession = SESSION_MAPPING[session] || session;
    const endpoints = [
        { name: "studentDetails", url: `${BASE_URL}/student-detsils-results?rollNo=${rollNo}` },
        { name: "subjectResults", url: `${BASE_URL}/student-results-subjects-list?semid=${semid}&rollNo=${rollNo}&session=${fullSession}` },
        { name: "sgpaDetails", url: `${BASE_URL}/student-results-sgpa?rollNo=${rollNo}&semid=${semid}&session=${fullSession}` }
    ];

    const responses = {};
    const requests = endpoints.map(async ({ name, url }) => {
        try {
            const response = await fetch(url, { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return { name, data: await response.json() };
        } catch (error) {
            return { name, data: { error: error.message } };
        }
    });

    (await Promise.all(requests)).forEach(({ name, data }) => {
        responses[name] = data;
    });

    return jsonResponse(responses);
}


/**
 * Generates an HTML response for results including SGPA
 * @param {Object} details - Student details
 * @param {Array} results - Subject results
 * @param {Object} sgpaDetails - SGPA details
 */
function htmlResponse(details, results, sgpaDetails) {
  const html = `<html>
  <head>
      <title>Student Results</title>
      <style>
          :root {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              --primary-color: #2563eb; /* Blue for primary color */
              --secondary-color: #1e40af; /* Dark blue for secondary */
              --light-bg: #f9fafb;
              --text-color: #333;
              --border-color: #e5e7eb;
          }

          body {
              background-color: #f0f4f8;
              color: var(--text-color);
              margin: 0;
              font-size: 16px;
          }

          .container {
              max-width: 1000px;
              margin: 2rem auto;
              padding: 2rem;
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          header {
              text-align: center;
              margin-bottom: 2rem;
              font-size: 2rem;
              font-weight: bold;
              color: var(--secondary-color);
          }

          .student-info {
              margin-bottom: 2rem;
              padding: 1.5rem;
              background: #f8f9fa;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }

          .student-info p {
              margin: 0.5rem 0;
              color: #555;
          }

          .student-info h2 {
              color: var(--secondary-color);
          }

          .student-info .sgpa {
              font-size: 1.2rem;
              font-weight: bold;
              color: var(--primary-color);
              margin-top: 1rem;
          }

          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1.5rem;
          }

          th {
              background-color: var(--primary-color);
              color: white;
              padding: 1rem;
              text-align: left;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
          }

          td {
              padding: 1rem;
              border-bottom: 1px solid var(--border-color);
          }

          tr:nth-child(even) {
              background-color: var(--light-bg);
          }

          tr:hover {
              background-color: #e1f5fe;
          }

          @media (max-width: 768px) {
              .container {
                  margin: 1rem;
                  padding: 1rem;
              }
              table {
                  font-size: 0.875rem;
              }
              th, td {
                  padding: 0.75rem;
              }
          }

          .footer {
              text-align: center;
              font-size: 0.9rem;
              margin-top: 2rem;
              color: #888;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <header>Student Results</header>
          
          <div class="student-info">
              <h2>${details?.studentName || 'Student Details'}</h2>
              <p><strong>Roll No:</strong> ${details?.rollNo || 'N/A'}</p>
              <p><strong>Branch:</strong> ${details?.branchName || 'N/A'}</p>
              <p><strong>SGPA:</strong> ${sgpaDetails?.sgpa || 'N/A'}</p>
          </div>

          <table>
              <thead>
                  <tr>
                      <th>Subject Code</th>
                      <th>Subject Name</th>
                      <th>Credits</th>
                      <th>Grade</th>
                  </tr>
              </thead>
              <tbody>
                  ${results.map(subject => `
                      <tr>
                          <td>${subject.subjectCODE}</td>
                          <td>${subject.subjectName}</td>
                          <td>${subject.subjectCredits}</td>
                          <td>${subject.grade}</td>
                      </tr>
                  `).join('')}
              </tbody>
          </table>

          <div class="footer">
              <p>&copy; 2025 Student Portal. All Rights Reserved.</p>
          </div>
      </div>
  </body>
</html>
`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
