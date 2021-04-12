console.log("for test");

let userData;
let forumData;
let postData;

function userAjax(d){
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/user-info`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        console.log("유저정보 조회");
        console.log(data);
        userData = data;
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

function forumAjax(d){
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        console.log("포럼과 디폴트포럼 조회");
        console.log(data);
        forumData = data;
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

function postAjax(d){
    const forumId = d.defaultForum.forumId;
    return $.ajax({
        url: `${window.API_GATEWAY_URI}/main/v1/forum/${forumId}/postview`,
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
    }).done(function(data){
        console.log("게시글과 게시글에 있는 덧글 조회");
        console.log(data);
        postData = data;
    }).fail(function(xhr, status, errorThrown){
        console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
    });
}

let job = () => {
    console.log("user data: ", userData);
    console.log("forum data: ", forumData);
    console.log("post data: ", postData);
}

function ajax(){
    userAjax();
    forumAjax().then(postAjax).done(job);
}

ajax();