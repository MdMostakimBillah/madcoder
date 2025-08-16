function navigation () {
    let navItems = document.querySelectorAll(".NavItems");
    navItems.forEach((item) => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
        })
    })
}
navigation ();

document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    const popup = document.getElementById("profile");

    if(selection.toString().length > 0){
        const selectedText = selection.toString().trim();

        if (selectedText.toLowerCase() === "mostakim billah" || selectedText.toLowerCase() === "mohammad mostakim billah") {
            popup.classList.add("showPopup"); 
        }

    }else{
        popup.classList.remove("showPopup");
    }
});

document.addEventListener("mousedown", function (e) {
  const popup = document.getElementById("profile");
  if (!popup.contains(e.target)) {
    popup.classList.remove("showPopup");
  }
});


let noteBook = document.querySelector("#NoteBook");
let noteBookView = document.querySelector(".NoteBook");
let closeView = document.querySelector(".closeIcon");
noteBook.addEventListener('click', function () {
    noteBookView.classList.toggle("showView");
});

closeView.addEventListener('click', function () {
    noteBookView.classList.toggle("showView");
})