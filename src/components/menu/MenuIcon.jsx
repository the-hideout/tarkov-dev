function MenuIcon(props) {
    return <div
        className = "mobile-icon"
        onClick = {props.onClick}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            >
            <path d="M492 236H20a20 20 0 100 40h472a20 20 0 100-40zM492 76H20a20 20 0 100 40h472a20 20 0 100-40zM492 396H20a20 20 0 100 40h472a20 20 0 100-40z"/>
        </svg>
    </div>
}

export default MenuIcon;


