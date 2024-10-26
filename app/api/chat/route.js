import { NextResponse } from "next/server";
export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const question = searchParams.get("question");

	if (!question) {
		return NextResponse.json(
			{ error: "Question is required" },
			{ status: 400 },
		);
	}

	try {
		const response = await fetch(
			`http://localhost:8080/chat/stream?question=${encodeURIComponent(
				question,
			)}`,
			{ method: "GET" },
		);

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const stream = new TransformStream();
		const writer = stream.writable.getWriter();
		const reader = response.body.getReader();

		const pump = async () => {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				await writer.write(value);
			}
			await writer.close();
		};

		pump();

		return new NextResponse(stream.readable, {
			headers: {
				"Content-Type": "text/plain",
				"Transfer-Encoding": "chunked",
			},
		});
	} catch (error) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: "An error occurred while processing your request" },
			{ status: 500 },
		);
	}
}
