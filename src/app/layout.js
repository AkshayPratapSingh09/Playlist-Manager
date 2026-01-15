export const metadata = {
    title: 'Watch Later Manager',
    description: 'Sync your YouTube Watch Later playlist',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
