$(document).ready(function(){
    var links = document.getElementsByTagName("a");
    var input = $("#search");
    var button = $("#search-button");
    var output = $(".reestr");
    button.click(function(){
        var text = input[0].value.toLowerCase();
        if(text.length>=4){
            for(var i = 0; i < links.length;i++){
                if(links[i].textContent.toLowerCase().includes(text)){
                    let code = links[i].parentElement.children[0].textContent.toString();
                    output[0].value="Код ОКПД2 "+code+links[i].textContent;
                    break;
                }
            }
        } 
    });
}); 