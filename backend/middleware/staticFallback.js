// backend/middleware/staticFallback.js

import path from "path";

export const staticFallback = (req, res, next) => {
    const isApi = req.path.startsWith('/api');
    const isSocket = req.path.startsWith('/socket.io');

    if (isApi || isSocket) {
        return next();
    }

    // Assuming you have access to your frontend build path here
    // If not, you might need to pass it in or define it globally
    const frontendBuildPath = path.resolve(__dirname, "../", "../", "frontend", "dist");
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
};