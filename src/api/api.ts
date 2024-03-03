/**
 * Fetch data from the server
 * @param url - The URL to fetch data from
 * @param method - The HTTP method to use
 * @param token - The token to use for authentication
 * @param body - The body of the request
 * @returns {Promise<ApiResponse>} - The response from the server
 */
async function fetchData(url: string, method: string,  token: string, body?: any): Promise<ApiResponse> {
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

export { fetchData };

