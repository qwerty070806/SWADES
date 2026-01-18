import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ApiDocsPage from "./pages/ApiDocsPage";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Main Chat Interface */}
				<Route path="/" element={<ChatPage />} />

				{/* API Documentation */}
				<Route path="/api-docs" element={<ApiDocsPage />} />

				{/* 404 Not Found */}
				<Route
					path="*"
					element={
						<div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
							<div className="text-center">
								<h1 className="text-6xl font-bold mb-4">404</h1>
								<p className="text-xl mb-8">Route not found</p>
								<div className="space-x-4">
									<Link
										to="/"
										className="text-blue-400 hover:underline">
										Go to Chat
									</Link>
									<Link
										to="/api-docs"
										className="text-blue-400 hover:underline">
										View API Docs
									</Link>
								</div>
							</div>
						</div>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
