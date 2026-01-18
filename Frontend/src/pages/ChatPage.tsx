import { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { ChatInterface } from "../components/chat/ChatInterface";
import {
	getConversations,
	getConversation,
	deleteConversation as apiDeleteConversation,
} from "../lib/api";
import { ConversationSafe } from "../types";
import { useDarkMode } from "../hooks/useDarkMode";

export default function ChatPage() {
	const [conversations, setConversations] = useState<ConversationSafe[]>([]);
	const [currentConversationId, setCurrentConversationId] = useState<
		string | null
	>(null);
	const [currentConversation, setCurrentConversation] =
		useState<ConversationSafe | null>(null);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const { isDark, toggle: toggleDarkMode } = useDarkMode();

	// Load conversations
	const loadConversations = async () => {
		const convs = await getConversations();
		setConversations(convs);
	};

	// Load current conversation
	const loadCurrentConversation = async () => {
		if (currentConversationId) {
			const conv = await getConversation(currentConversationId);
			setCurrentConversation(conv);
		} else {
			setCurrentConversation(null);
		}
	};

	useEffect(() => {
		loadConversations();
	}, []);

	useEffect(() => {
		loadCurrentConversation();
	}, [currentConversationId]);

	const handleNewConversation = () => {
		setCurrentConversationId(null);
		setCurrentConversation(null);
	};

	const handleSelectConversation = (id: string) => {
		setCurrentConversationId(id);
	};

	const handleDeleteConversation = async (id: string) => {
		const success = await apiDeleteConversation(id);
		if (success) {
			if (currentConversationId === id) {
				handleNewConversation();
			}
			await loadConversations();
		}
	};

	const handleMessagesUpdate = async () => {
		await loadConversations();
		await loadCurrentConversation();

		// If we don't have a current conversation ID but we just sent a message,
		// the API would have created one. Let's find it.
		if (!currentConversationId) {
			const convs = await getConversations();
			if (convs.length > 0) {
				const latest = convs.reduce((a, b) =>
					new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b
				);
				setCurrentConversationId(latest.id);
			}
		}
	};

	return (
		<div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
			<Sidebar
				conversations={conversations}
				currentConversationId={currentConversationId}
				onSelectConversation={handleSelectConversation}
				onNewConversation={handleNewConversation}
				onDeleteConversation={handleDeleteConversation}
				isDark={isDark}
				onToggleDarkMode={toggleDarkMode}
				isCollapsed={isSidebarCollapsed}
				onToggleCollapse={() =>
					setIsSidebarCollapsed(!isSidebarCollapsed)
				}
			/>
			<div className="flex-1 overflow-hidden">
				<ChatInterface
					conversationId={currentConversationId}
					messages={currentConversation?.messages || []}
					onMessagesUpdate={handleMessagesUpdate}
				/>
			</div>
		</div>
	);
}
