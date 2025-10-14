export interface VerifySignalResponse {
    verified: boolean;
}

export interface RandomResponse {
    random: string;
}

/**
 * Fetches a cryptographically secure random value from the backend.
 */
export async function getRandom(baseUrl: string = "http://localhost:3000"): Promise<RandomResponse> {
    const res = await fetch(`${baseUrl}/random`);
    if (!res.ok) throw new Error(`Error fetching random value: ${res.status}`);
    return res.json();
}

/**
 * Verifies a signed signal using the backend.
 * @param publicKey - The public key of the sender
 * @param data - The signed message/data
 * @param signature - The digital signature to verify
 */
export async function verifySignal(
    publicKey: string,
    data: string,
    signature: string,
    baseUrl: string = "http://localhost:3000"
): Promise<VerifySignalResponse> {
    const res = await fetch(`${baseUrl}/verify-signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, data, signature }),
    });
    
    if (!res.ok) throw new Error(`Error verifying signal: ${res.status}`);
    return res.json();
}
