let navItems = document.querySelectorAll(".NavItems");

navItems.forEach((item) => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");
    })
})