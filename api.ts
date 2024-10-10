const API_URL = "http://192.168.11.111:3100";


export async function fetchData(route: string): Promise<any> {
    try {
        const response = await fetch(`${API_URL}/api/${route}`);
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { success: true, message: "Successfully got data!", data };
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            return {
                success: false,
                message: "Unexpected response format",
            };
        }
    } catch (error: unknown) {
        console.log("Error fetching data:", error);
        return {
            success: false,
            message: "Error fetching data - " + (error instanceof Error ? error.message : "Unknown error"),
        };
    }
}

export async function postData(route: string, body: any): Promise<any> {
    if (!route || route.includes('undefined')) {
        console.error("Invalid route:", route);
        return {
            success: false,
            message: "Invalid route",
        };
    }

    try {
        const response = await fetch(`${API_URL}/api/${route}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                if (data.success) {
                    console.log('Response data:', data);
                    return { success: true, message: "Request success! " + data.message, scanId: data.scanId, urlSafety: data.urlSafety };
                } else {
                    return { success: false, message: "Request failed. " + data.message };
                }
            } else {
                return { success: false, message: "Request failed with status " + response.status };
            }
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            return {
                success: false,
                message: "Unexpected response format",
            };
        }
    } catch (error: unknown) {
        console.error("Error submitting form: " + error);
        return { success: false, message: "Error submitting form: " + (error instanceof Error ? error.message : "Unknown error") };
    }
}

export async function toggleFavorite(id: number, isFavorite: boolean): Promise<any> {
    try {
        const url = isFavorite ? `scans/${id}/unfavorite` : `scans/${id}/favorite`;
        const response = await fetch(`${API_URL}/api/${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                console.log({ success: true, message: data.message });
                return { success: true, message: data.message };

            } else {
                return { success: false, message: "Request failed with status " + response.status };
            }
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            return {
                success: false,
                message: "Unexpected response format",
            };
        }
    } catch (error: unknown) {
        console.error("Error toggling favorite: " + error);
        return { success: false, message: "Error toggling favorite: " + (error instanceof Error ? error.message : "Unknown error") };
    }
}

export async function deleteScan(id: number): Promise<any> {
    try {
        const response = await fetch(`${API_URL}/api/scans/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: "Request failed with status " + response.status };
            }
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            return {
                success: false,
                message: "Unexpected response format",
            };
        }
    } catch (error: unknown) {
        console.error("Error deleting scan: " + error);
        return { success: false, message: "Error deleting scan: " + (error instanceof Error ? error.message : "Unknown error") };
    }
}

export async function deleteAllScans(userId: number): Promise<any> {
    try {
        const response = await fetch(`${API_URL}/api/scans`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }), // Inclure le userId dans le corps de la requête
        });
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: "Request failed with status " + response.status };
            }
        } else {
            const text = await response.text();
            console.error("Unexpected response format:", text);
            return {
                success: false,
                message: "Unexpected response format",
            };
        }
    } catch (error: unknown) {
        console.error("Error deleting all scans: " + error);
        return { success: false, message: "Error deleting all scans: " + (error instanceof Error ? error.message : "Unknown error") };
    }
}