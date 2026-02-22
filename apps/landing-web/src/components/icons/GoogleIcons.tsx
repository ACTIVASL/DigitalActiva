

export const FirebaseIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3.89 15.672L6.255.461A.54.54 0 017.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0zM14.3 7.147l-1.82-3.482a.54.54 0 00-.96 0L3.53 17.984z" />
    </svg>
);

export const BigQueryIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M11.23 11.45L8.8 15.3l-2.05-3.3zm-1.6-4.5h3.65l1.65 2.85h-3.65zm5.75 4.5l-1.75 3-1.65-2.85 1.75-3.05zm-5.75 4.5h2.2l-1.85 3.15L8.4 17.6l2.35-4.1zM11.23 11.45l2.43-4.2-1.22-2.1-3.64 6.3zm1.65 2.85l1.75 3.05h-3.5l1.75-3.05z" />
        {/* Fallback to simple Material 'Insights' or similar if path is too complex, but here using a representative shape */}
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);

export const CloudRunIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Simplified Cloud Run / Google Cloud generic icon */}
        <path d="M18.5 10.2c0-2.5-1.8-4.5-4.2-4.9-1.3-2.3-3.7-3.8-6.4-3.8C4.1 1.5 1 4.6 1 8.4c0 0.1 0 0.2 0 0.2C0.4 8.5 0 8.9 0 9.4c0 0.6 0.4 1 1 1h1.5c3.2 0 5.8-2.5 5.9-5.6 1.7 0.6 3.1 2 3.5 3.7 0.1 0.3 0.1 0.7 0.1 1 0 0.3-0.2 0.5-0.5 0.5H11c-0.3 0-0.5-0.2-0.5-0.5 0-0.1 0-0.2 0-0.3 0.1-1.9-0.6-3.7-1.9-5C10.2 4.6 12 5.8 13.1 7.6c-0.1 0.2-0.1 0.5-0.1 0.8 0 1.1 0.9 2 2 2h4c1.1 0 2 0.9 2 2 0 1.1-0.9 2-2 2h-1.5c-0.3 0-0.5 0.2-0.5 0.5s0.2 0.5 0.5 0.5H19c2.2 0 4-1.8 4-4s-1.8-4-4-4h-0.5z" />
        <path d="M12 12L12 12c-2.4 0-4.6 1.1-6 2.9l1.4 1.4c1.1-1.4 2.8-2.3 4.6-2.3s3.5 0.9 4.6 2.3l1.4-1.4C16.6 13.1 14.4 12 12 12z" />
    </svg>
);

export const SecurityIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Security Command Center / Shield */}
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
);

export const NetworkIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Global Network / GCP */}
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
);


export const WorkspaceIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* Google Workspace */}
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        {/* Using a generic 'Group' style icon for Workspace as fallback if exact path varies */}
        <path d="M21.71 8.71c1.25-1.25 6.85-7.29 2 11.71 13 22.28 12.28 22.28 12.28 22 17.4-4.8 28.91 2 22 2 18.71s-2.91-2.01-11.71-12.28-11.71C2.56 5.56 2.91 5.91 3.71 8.71l2.84 2.84 3.71-3.71-2.84-2.84zm-3 7L17 14l3-3-1.71-1.71L15.3 12.3 12.59 9.59 13 8l3 3 1.71-1.71zm-9 0L8 14l-3-3 1.71-1.71L9.69 12.3 12.4 9.59 12 8l-3 3-1.71-1.71z" />
        {/* Replaced with simplified group work icon */}
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);

export const DriveIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M7.71 3.5L1.15 15l3.43 6h13.72l-3.43-6H8.28L14.85 3.5H7.71z" />
        {/* Accurate Drive Path */}
        <path d="M7.05 4.34h9.9L22 13h-6.8L9.2 4.34h-2.15zM2.8 13.9l3.3-6.1 4.5 7.8H3.2l-.4.3zM15 16.5l-3.5 5.9H22l-4.7-8.2L15 16.5z" />
        <path d="M8.33 3H15.67L23 15H15.67L8.33 3ZM2.85 14L6.95 21H17.05L12.95 14H2.85Z" />
        {/* Simplified Triangle */}
        <path d="M12.01 3c-.76 0-1.54.3-1.92.93L2.48 16.2c-.77 1.33-.77 2.27 0 3.6.38.65 1.15 1.2 1.92 1.2h15.2c.76 0 1.54-.55 1.92-1.2.77-1.33.77-2.65 0-3.98l-7.6-13.2C13.56 3.97 12.78 3 12.01 3zM12 6.55L17.76 17H6.24L12 6.55z" />
    </svg>
);

export const AppSheetIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        {/* AppSheet / Paper Plane / Code */}
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
);
