/**
 * SSE Streaming utility using fetch + ReadableStream
 * Supports Authorization headers (unlike EventSource)
 */

interface SSEOptions {
    onChunk: (text: string) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
    return localStorage.getItem("access_token");
}

/**
 * Consume SSE stream from a URL
 * Returns a cleanup function to abort the stream
 */
export function consumeSSE(url: string, options: SSEOptions): () => void {
    const controller = new AbortController();

    const fetchStream = async () => {
        try {
            const token = getAccessToken();

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                },
                signal: controller.signal,
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`SSE Error: ${response.status} ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No response body reader available");
            }

            const decoder = new TextDecoder();
            let partialData = "";
            let eventData = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    if (eventData && eventData !== "[DONE]") {
                        options.onChunk(eventData);
                    }
                    options.onComplete?.();
                    break;
                }

                // Decode chunk and append to partial data
                const chunk = decoder.decode(value, { stream: true });
                const lines = (partialData + chunk).split("\n");
                
                // The last element is either a partial line or empty string if chunk ends in \n
                partialData = lines.pop() || "";

                for (const line of lines) {
                    // Handle \r if the server uses \r\n
                    const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
                    
                    if (cleanLine.startsWith("data:")) {
                        let data = cleanLine.slice(5);
                        // SSE spec allows one optional space after data:
                        if (data.startsWith(" ")) {
                            data = data.slice(1);
                        }
                        eventData = eventData === "" ? data : eventData + "\n" + data;
                    } else if (cleanLine === "") {
                        // Empty line marks end of event
                        if (eventData !== "") {
                            if (eventData !== "[DONE]") {
                                options.onChunk(eventData);
                            }
                            eventData = "";
                        }
                    } else if (!cleanLine.startsWith(":")) {
                        // Handle plain text without SSE format as fallback
                        // (only if we aren't accumulating an SSE event)
                        if (eventData === "" && cleanLine.trim() !== "") {
                            options.onChunk(cleanLine);
                        }
                    }
                }
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                return;
            }
            options.onError?.(error as Error);
        }
    };

    fetchStream();

    return () => {
        controller.abort();
    };
}

/**
 * Consume SSE stream with POST body (supports JSON or FormData)
 */
export function consumeSSEWithBody(
    url: string,
    body: string | object | FormData,
    options: SSEOptions
): () => void {
    const controller = new AbortController();

    const fetchStream = async () => {
        try {
            const token = getAccessToken();
            const headers: Record<string, string> = {
                Authorization: token ? `Bearer ${token}` : "",
                Accept: "text/event-stream",
                "Cache-Control": "no-cache",
            };

            let requestBody: any;
            if (body instanceof FormData) {
                requestBody = body;
                // Note: Fetch will automatically set content-type for FormData with boundary
            } else {
                headers["Content-Type"] = "application/json";
                requestBody = typeof body === "string" ? body : JSON.stringify(body);
            }

            const response = await fetch(url, {
                method: "POST",
                headers,
                body: requestBody,
                signal: controller.signal,
                credentials: "include",
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SSE Error: ${response.status} ${errorText || response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("No response body reader");
            }

            const decoder = new TextDecoder();
            let partialData = "";
            let eventData = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    if (eventData && eventData !== "[DONE]") {
                        options.onChunk(eventData);
                    }
                    options.onComplete?.();
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = (partialData + chunk).split("\n");

                // Keep the last partial line if it doesn't end with a newline
                partialData = lines.pop() || "";

                for (const line of lines) {
                    const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
                    
                    if (cleanLine.startsWith("data:")) {
                        let data = cleanLine.slice(5);
                        if (data.startsWith(" ")) {
                            data = data.slice(1);
                        }
                        eventData = eventData === "" ? data : eventData + "\n" + data;
                    } else if (cleanLine === "") {
                        if (eventData !== "") {
                            if (eventData !== "[DONE]") {
                                options.onChunk(eventData);
                            }
                            eventData = "";
                        }
                    } else if (!cleanLine.startsWith(":")) {
                        if (eventData === "" && cleanLine.trim() !== "") {
                            options.onChunk(cleanLine);
                        }
                    }
                }
            }
        } catch (error) {
            if ((error as Error).name === "AbortError") {
                return;
            }
            options.onError?.(error as Error);
        }
    };

    fetchStream();

    return () => {
        controller.abort();
    };
}

