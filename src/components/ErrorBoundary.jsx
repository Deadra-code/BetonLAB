import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * A generic Error Boundary component to catch JavaScript errors in their child component tree,
 * log those errors, and display a fallback UI instead of a crashed component tree.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center h-full w-full text-center p-4 bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-12 w-12 mb-4" />
                    <h1 className="text-xl font-bold">Terjadi Kesalahan</h1>
                    <p className="mt-2 text-sm">
                        Terjadi kesalahan pada bagian aplikasi ini. Coba muat ulang aplikasi.
                    </p>
                    {/* Optionally, show error details in development */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-left bg-black/20 p-2 rounded-md text-xs">
                            <summary>Detail Error</summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
