import { Navigate } from "react-router-dom"
import { hasAccessToken } from "../utils/auth"

const ProtectedRoute = ({ children }) => {
    const token = hasAccessToken()

    if (!token) {
        return <Navigate to="/login" />
    }

    return children
}

export default ProtectedRoute