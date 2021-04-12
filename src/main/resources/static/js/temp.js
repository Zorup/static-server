
/**
 * 초기데이터 불러오고 화면에 데이터 매핑하기
 */
const initData = {
    userData: "",
    forumData: "",
    postData: "",
}

let userAjax = (prev) => {   // 유저정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/user-info`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.userData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

let forumAjax = (prev) => {  // 포럼 리스트와 기본포럼 정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.forumData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

let postAjax = (prev) => {   // 기본포럼의 피드정보 요청, forumAjax()에 의존적
    const forumId = prev.defaultForum.forumId;
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum/${forumId}/postview`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.postData = data;    // data 저장
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

let drawForum = () => { // 포럼리스트 그리는 모듈
    let source = document.querySelector("#forum-button").innerText;
    let template = Handlebars.compile(source);
    let wrapper = {
        forumList: initData.forumData.forumList
    };
    let result = template(wrapper);
    document.querySelector(".nav-item > .forum-list").innerHTML = result;
}

let initDraw = () => {   // 초기데이터로 화면 그리는 function
    // console.log("user data: ", initData.userData);
    // console.log("forum data: ", initData.forumData);
    // console.log("post data: ", initData.postData);
    drawForum();
}

function initAjax(){    // 초기데이터 불러오고 화면그리기
    userAjax();
    forumAjax().then(postAjax).done(initDraw);   // forumAjax 응답받은 후 응답데이터 이용해 postAjax 요청
}

initAjax();








let deleteForumList = [];

$('input[name=fList]').click(function(){
    let ischecked = $(this).is(":checked");
    if(ischecked){
        deleteForumList.push($(this).val());
        //console.log($(this).val());
    }else{
        deleteForumList = deleteForumList.filter((element)=> element !== $(this).val());
        // console.log("배열 원소 삭제 "+$(this).val());
    }
});

function logout(){
    $.ajax({
        url: '/v1/logout',
        type: 'POST',
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href="/login";
    }).fail(function(){
        alert("실패하였습니다.");
    });
}

function addForum(){
    let forumName = $('#InputForumName').val();

    $.ajax({
        url: '/v1/forum',
        type: 'POST',
        data: {
            forumName: forumName,
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href = "/template";
    }).fail(function(){
        alert("유효하지 않은 입력이거나, 네트워크 오류가 존재합니다. 다시 시도해주세요.");
    });
}

function deleteForum(){
    alert("delte");

    $.ajax({
        url: '/v1/forum',
        type: 'DELETE',
        data: {
            forumId: deleteForumList,
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href = "/template";
    }).fail(function(){
        alert("유효하지 않은 입력이거나, 네트워크 오류가 존재합니다. 다시 시도해주세요.");
    });
    deleteForumList = [];
}


function switchFeed(param){
    let url = '/template/' + param;
    location.href = url;
}

function changeLikes(postId){
    $.ajax({
        url: '/v1/like',
        type: 'POST',
        data: {
            postId: postId,
        },
        xhrFields: {
            withCredentials: true
        }
    }).done(function(data){
        $('.testLike').text(data['data']);
    }).fail(function(){
        alert("유효하지 않은 입력이거나, 네트워크 오류가 존재합니다. 다시 시도해주세요.");
    });
}