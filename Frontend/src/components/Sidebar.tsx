import {
	MessageSquare,
	Trash2,
	Plus,
	Moon,
	Sun,
	PanelLeftClose,
	PanelLeft,
	Search,
	Menu,
	GripVertical,
} from "lucide-react";
import { ConversationSafe as Conversation } from "../types";
import { useState, useRef, useEffect } from "react";

interface SidebarProps {
	conversations: Conversation[];
	currentConversationId: string | null;
	onSelectConversation: (id: string) => void;
	onNewConversation: () => void;
	onDeleteConversation: (id: string) => void;
	isDark: boolean;
	onToggleDarkMode: () => void;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}

export function Sidebar({
	conversations,
	currentConversationId,
	onSelectConversation,
	onNewConversation,
	onDeleteConversation,
	isDark,
	onToggleDarkMode,
	isCollapsed,
	onToggleCollapse,
}: SidebarProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [sidebarWidth, setSidebarWidth] = useState(256); // default 64 * 4 = 256px
	const [isResizing, setIsResizing] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const sortedConversations = [...conversations].sort(
		(a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing) return;

			const newWidth = e.clientX;
			if (newWidth >= 200 && newWidth <= 500) {
				setSidebarWidth(newWidth);
			}
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizing]);

	// Mobile menu button
	const MobileMenuButton = () => (
		<button
			onClick={() => setIsMobileMenuOpen(true)}
			className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
			title="Open menu">
			<Menu className="w-5 h-5" />
		</button>
	);

	// Desktop collapsed state
	if (isCollapsed && window.innerWidth >= 768) {
		return (
			<>
				<div className="w-0 relative hidden md:block">
					<button
						onClick={onToggleCollapse}
						className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
						title="Open sidebar">
						<PanelLeft className="w-5 h-5" />
					</button>
				</div>
				<MobileMenuButton />
			</>
		);
	}

	const SidebarContent = () => (
		<>
			{/* Header with logo and collapse button */}
			<div className="p-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
						<MessageSquare className="w-5 h-5 text-white" />
					</div>
				</div>
				<button
					onClick={() => {
						onToggleCollapse();
						setIsMobileMenuOpen(false);
					}}
					className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
					title="Close sidebar">
					<PanelLeftClose className="w-5 h-5" />
				</button>
			</div>

			{/* Actions Section */}
			<div className="px-2 pb-3 space-y-1">
				<button
					onClick={() => {
						onNewConversation();
						setIsMobileMenuOpen(false);
					}}
					className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors text-sm">
					<Plus className="w-5 h-5" />
					New chat
				</button>
				<button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors text-sm">
					<Search className="w-5 h-5" />
					Search chats
				</button>
			</div>

			{/* Divider */}
			<div className="border-t border-gray-800 mx-2"></div>

			{/* Your chats Section */}
			<div className="flex-1 overflow-y-auto pt-3">
				<div className="px-4 pb-2">
					<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Your chats
					</h3>
				</div>

				{sortedConversations.length === 0 ? (
					<div className="px-4 py-8 text-center text-sm text-gray-500">
						No conversations yet
					</div>
				) : (
					<div className="px-2 space-y-0.5">
						{sortedConversations.map((conv) => (
							<div
								key={conv.id}
								className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
									currentConversationId === conv.id
										? "bg-gray-800 text-gray-100"
										: "text-gray-300 hover:bg-gray-800 hover:text-gray-100"
								}`}
								onClick={() => {
									onSelectConversation(conv.id);
									setIsMobileMenuOpen(false);
								}}>
								<MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
								<div className="flex-1 min-w-0 text-sm truncate">
									{conv.title}
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										onDeleteConversation(conv.id);
									}}
									className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-opacity"
									title="Delete conversation">
									<Trash2 className="w-4 h-4 text-gray-400" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className="border-t border-gray-800 p-2">
				<button
					onClick={onToggleDarkMode}
					className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-gray-100 rounded-lg transition-colors text-sm">
					{isDark ? (
						<>
							<Sun className="w-5 h-5" />
							Light mode
						</>
					) : (
						<>
							<Moon className="w-5 h-5" />
							Dark mode
						</>
					)}
				</button>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile menu button when sidebar is hidden */}
			{!isMobileMenuOpen && <MobileMenuButton />}

			{/* Mobile overlay backdrop */}
			{isMobileMenuOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black/50 z-40"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				ref={sidebarRef}
				className={`
          fixed md:relative inset-y-0 left-0 z-50 md:z-0
          flex flex-col h-screen bg-gray-950 text-gray-100 transition-all duration-300
          ${
				isMobileMenuOpen
					? "translate-x-0"
					: "-translate-x-full md:translate-x-0"
			}
        `}
				style={{
					width:
						window.innerWidth >= 768
							? `${sidebarWidth}px`
							: "280px",
				}}>
				<SidebarContent />

				{/* Resize handle - desktop only */}
				<div
					className="hidden md:block absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group"
					onMouseDown={() => setIsResizing(true)}>
					<div className="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
						<GripVertical className="w-4 h-4 text-gray-500" />
					</div>
				</div>
			</div>
		</>
	);
}
