/**
 * page history UX 개선용
 */
$(window).on('hashchange', function(){
    if(window.location.hash.slice(1,6) === "forum"){
        let forumId = window.location.hash.slice(7);
        switchFeed(forumId);
    }
});



/**
 * 초기데이터 불러오고 랜더링 완료 후 이벤트헨들러 등록
 */
let deleteForumList = [];

const initData = {
    userData: "",
    forumData: "",
    postData: "",
}

const userAjax = (prev) => {   // 유저정보 요청
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

const forumAjax = (prev) => {  // 포럼 리스트와 기본포럼 정보 요청
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

const postAjax = (prev) => {   // 기본포럼의 피드정보 요청, forumAjax()에 의존적
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

const drawFeed = () => {    // 피드리스트 그리는 모듈
    const source = document.querySelector("#feed").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        postList: initData.postData.list
    };
    let result = template(wrapper);
    document.querySelector(".container-fluid").innerHTML = result;
}

const forumButton = () => { // 좌측네비 포럼버튼
    const source = document.querySelector("#forum-button").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        forumList: initData.forumData.forumList
    };
    let result = template(wrapper);
    document.querySelector(".nav-item > .forum-list").innerHTML = result;
}

const putDefaultForumId = (fId) => {   // 디폴트포럼 아이디 필요한부분 채우기
    document.querySelectorAll(".current-forum-id").forEach((item)=>{
        item.value = fId;
    });
}

const forumDeleteCheckbutton = () => {    // 포럼삭제 체크박스
    const source2 = document.querySelector("#forum-delete-checkbox").innerText;
    let template = Handlebars.compile(source2);
    const wrapper = {
        forumList: initData.forumData.forumList
    };
    result = template(wrapper);
    document.querySelector(".forum-delete-list").innerHTML = result;
}

const drawForum = () => { // 포럼관련 그리는 모듈
    forumButton();
    putDefaultForumId(initData.forumData.defaultForum.forumId);
    forumDeleteCheckbutton();
}

const drawUser = () => {    // 유저프로필 채우는 모듈
    const userProfile = document.querySelectorAll(".login-user-name");
    document.querySelectorAll(".login-user-name").forEach((item)=>{
        item.innerText = initData.userData.data.name;
    });
}

const initDraw = () => {   // 초기데이터로 화면 그리는 function
    console.log("user data: ", initData.userData);
    console.log("forum data: ", initData.forumData);
    console.log("post data: ", initData.postData);
    drawFeed(); // drawForum 보다 먼저 불려야함!
    drawUser();
    drawForum();
}

const forumDeleteCheckEvent = () => {    // 체크박스 체크/해제 클릭 이벤트
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
}

const likeButtonEvent = () => {
    $('.like-button').click(function(){
        let temp = this;
        let postId = temp.parentElement.childNodes[1].value;
        $.ajax({
            url: `${window.API_GATEWAY_URI}/main/v1/like`,
            type: 'POST',
            data: {
                postId: postId,
            },
            xhrFields: {
                withCredentials: true
            }
        }).done(function(data){
            temp.childNodes[1].innerText = data['data'];
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    });
}

const initAddEvent = () => {
    forumDeleteCheckEvent();
    likeButtonEvent();
}

const initAjax = () => {    // 초기데이터 불러오고 화면그리는 function
    userAjax();
    forumAjax().then(postAjax).done(() => {
        initDraw(); initAddEvent(); // forumAjax 응답받은 후 응답데이터 이용해 postAjax 요청
        window.location.hash = `forum/${initData.forumData.defaultForum.forumId}`;  // history UX용
    });
}

initAjax();





/**
 * 버튼동작들
 */
const addForum = () => {
    let forumName = $('#InputForumName').val();

    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
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

const deleteForum = () => {
    alert("delte");

    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
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

const logout = () => {
    $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/logout`,
        type: 'POST',
        xhrFields: {
            withCredentials: true
        }
    }).done(function(){
        location.href=`/`;
    }).fail(function(){
        alert("실패하였습니다.");
    });
}


const switchFeedAjax = (fid) => {   // 클릭된 포럼의 피드정보 요청
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum/${fid}/postview`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        initData.postData = data;    // data 저장 (initData 객체 계속 이용)
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

const drawSwitchedFeed = (pList) => {    // 피드리스트 그리는 모듈
    const source = document.querySelector("#feed").innerText;
    let template = Handlebars.compile(source);
    const wrapper = {
        postList: pList
    };
    let result = template(wrapper);
    document.querySelector(".container-fluid").innerHTML = result;
}



const switchFeed = (param) => {
    switchFeedAjax(param).done(() => {
        drawSwitchedFeed(initData.postData.list);
        drawUser();
        putDefaultForumId(param);
        likeButtonEvent();

        window.location.hash = `forum/${param}`;    // history UX용
    });
}