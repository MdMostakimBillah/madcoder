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


let noteBookView = document.querySelector(".NoteBook");
let GuessNumberGameView = document.querySelector(".GuessNumberGame");
let ColorBundleView = document.querySelector(".ColorBundle");
let ToDoView = document.querySelector(".ToDo");
let schoolManagementView = document.querySelector(".schoolManagement");
let temperatureConverterView = document.querySelector(".temperatureConverter");
let MomentCloneView = document.querySelector(".MomentClone");
let ShopeStyleCloneView = document.querySelector(".ShopeStyleClone");
let couveeCloneView = document.querySelector(".couveeClone");

let txtContent = document.querySelector(".here-container");
let closeView = document.querySelector(".closeIcon");

function ClassListAddingFunction(x) {
    if (x == 1) {
        noteBookView.classList.add("showView");
    }else if (x == 2) {
        ToDoView.classList.add("showView");
    }else if(x == 3) {
        ColorBundleView.classList.add("showView");
    }else if(x == 4){
        GuessNumberGameView.classList.add("showView");
    }else if(x == 5){
        schoolManagementView.classList.add("showView");
    }else if (x == 6) {
        temperatureConverterView.classList.add("showView");
    }else if(x == 7) {
        MomentCloneView.classList.add("showView");
    }else if(x == 8) {
        ShopeStyleCloneView.classList.add("showView");
    }else if(x == 9) {
        couveeCloneView.classList.add("showView");
    }
}



function closePopup(x) {
    if(x == 1){
        noteBookView.classList.remove("showView");  
    }else if (x == 2) {
        ToDoView.classList.remove("showView");
    }else if(x == 3) {
        ColorBundleView.classList.remove("showView");
    }else if(x == 4){
        GuessNumberGameView.classList.remove("showView");
    }else if(x == 5){
        schoolManagementView.classList.remove("showView");
    }else if (x == 6) {
        temperatureConverterView.classList.remove("showView");
    }else if(x == 7) {
        MomentCloneView.classList.remove("showView");
    }else if(x == 8) {
        ShopeStyleCloneView.classList.remove("showView");
    }else if(x == 9) {
        couveeCloneView.classList.remove("showView");
    }
}

