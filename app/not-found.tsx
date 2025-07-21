import Navbar from "@/components/Navbar";
export default function NotFoundPage() {
    return (
        <>
            <Navbar variant="backBtn" hideLogin />
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <div className="card p-4 text-center" style={{ maxWidth: '400px' }}>
                    <h1 className="display-4">404</h1>
                    <h3 className="mb-3">Page not found</h3>
                    <p className="text-muted">The page you're looking for doesn't exist or has been moved..</p>
                    <a href="/" className="btn btn-primary mt-2">Back to Asset List</a>
                </div>
            </div>
        </>
    );
}