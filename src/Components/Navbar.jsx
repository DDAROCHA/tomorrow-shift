import { Link } from "react-router-dom"

export function Navbar() {
    return (
        <>
            <Link to="/">
                <button>Home Page</button>
            </Link>
            <Link to="/Page1">
                <button>Page 1</button>
            </Link>
            <Link to="/Page2">
                <button>Page 2</button>
            </Link>
            <Link to="/Page3">
                <button>Page 3</button>
            </Link>
        </>
    )
}
