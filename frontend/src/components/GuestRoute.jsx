import { Navigate } from "react-router-dom"
import { hasAccessToken } from "../utils/auth"

const GuestRoute = ({ children }) => {
    const token = hasAccessToken()

    if (token) {
        return <Navigate to="/dashboard" />
    }

    return children
}

export default GuestRoute
