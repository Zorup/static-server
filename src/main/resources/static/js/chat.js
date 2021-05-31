

$(function () {


    /**
     * websocket, stomp api
     */
    let socket = new WebSocket("ws://localhost:8081/chat/chat-conn");   // 연결url
    let client = Stomp.over(socket);
    client.debug = function (e) {
        console.log(e);
    }

    client.connect({}, function(){  // 연결
        let body = "i want to subscribe you";
        client.subscribe(`/topic/${initData.userData.data.userId}`, function(m){
            receiveMessage(JSON.parse(m.body));
        });
        // client.send('/app/send-test', {}, JSON.stringify(body));
    });





    let openedRoomId = null;                     // 열어놓은 채팅방
    let isListOpen = 0;                         // 채팅방 리스트가 열려있는지

    let chatButton = $('#button-chat-list');    // 우측하단 대화 아이콘
    let chatList = $('#chat-list');             // 채팅방 리스트 틀
    let chatRoom = $('#chat-list > ul > li > .chat-room');  // 채팅방 리스트 속 하나하나, 챗아이콘 클릭시마다 바뀔 수 있음에 주의
    let chatView = $('.chat-view');             // 챗뷰 (열린 채팅방 틀)
    let chatSendBtn = $('.button-chat-send');   // 메시지 전송버튼
    let messageInput = $('.chat-write-form > textarea');    // 메시지 입력칸


    /**
     *  DB데이터 대신 쓸 테스트용 데이터
     */
    let testMList = [
        [
            { message: "안녕하세요", whose: "chat-message-oth"},
            { message: "네 안녕하세요 주훈씨", whose: "chat-message-my"},
            { message: "네 안녕하세요!", whose: "chat-message-oth"}
        ],
        [
            { message: "안녕하세요", whose: "chat-message-oth"},
            { message: "네 안녕하세요 한성씨", whose: "chat-message-my"},
            { message: "네 안녕하세요!", whose: "chat-message-oth"}
        ],
        [
            { message: "안녕하세요", whose: "chat-message-oth"},
            { message: "네 안녕하세요 예찬씨", whose: "chat-message-my"},
            { message: "네 안녕하세요!", whose: "chat-message-oth"}
        ]
    ];
    let testRList = [
        { roomId: "1", roomName: "박주훈"},
        { roomId: "2", roomName: "김한성"},
        { roomId: "3", roomName: "김예찬"}
    ];


    // ajax로 받아온 데이터 보관용
    const ajaxWrapper = {
        openRoomList: "",
        chatLog: "",
    }

    /**
     * Ajax Module
     */
    // 채팅방 목록을 역순(최근 이벤트 발생시간 기준)으로 불러온다
    const getOpenRoomList = (uid) => {
        return $.ajax({
            url: `${window.API_GATEWAY_URI}/chat/${uid}/rooms`,
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
        }).done(function(data){
            console.log(data);
            ajaxWrapper.openRoomList = data;
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    }
    // 특정 방의 채팅기록을 불러온다
    const getChatLog = (rid) => {
        return $.ajax({
            url: `${window.API_GATEWAY_URI}/chat/${rid}/chat-logs`,
            type: 'GET',
            xhrFields: {
                withCredentials: true
            },
        }).done(function(data){
            console.log(data);
            ajaxWrapper.chatLog = data;
        }).fail(function(xhr, status, errorThrown){
            console.log(`ajax failed! ${xhr.status}: ${errorThrown}`);
        });
    }




    /**
     *  Module
     */
    const showChatView = (id) => {
        // 넘어온 id에 해당하는 채팅방의 메시지기록을 DB에서 불러온다
        $.when(getChatLog(id)).done(() => {

            // 보낸이가 나인지 상대인지 검사하고
            // 그에따라 메시지 dom 요소의 class를 지정해 좌우 위치 구분
            let myId = initData.userData.data.userId;
            for(let obj of ajaxWrapper.chatLog){
                obj.sender === myId ? obj.whose = "chat-message-my" : obj.whose = "chat-message-oth";
            }

            // 정제 기록을 템플릿에 매핑하고 챗뷰 틀에 붙여준다
            const source = document.querySelector('#chat-view-innerList').innerText;
            let template = Handlebars.compile(source);
            const wrapper = {
                messageList: ajaxWrapper.chatLog
            };
            result = template(wrapper);
            document.querySelector('.chat-view > .chat-content > ul').innerHTML = result;

            // 챗뷰를 오픈한다
            chatView.show();
            openedRoomId = id;
        });

    }
    const hideChatView = () => {
        // 챗뷰를 닫는다
        chatView.hide();
        openedRoomId = null;

        // 챗뷰 틀에서 메시지들을 지운다
        document.querySelector('.chat-view > .chat-content > ul').innerHTML = "";
    }
    const toggleChatList = () => {
        // 채팅방 리스트를 토글한다 (show / hide)

        if(isListOpen == 1){    // 닫기
            chatList.hide();
            isListOpen = 0;

            // 채팅방 리스트를 지워준다
            $('#chat-list > ul > li > div.chat-room').parent().remove();
        } else{                 // 열기

            // 채팅방 리스트를 DB에서 불러온다
            let userId = initData.userData.data.userId;
            $.when(getOpenRoomList(userId)).done(() => {

                // 불러온 리스트를 템플릿에 매핑하고 방목록 틀에 붙여준다.
                const source = document.querySelector('#chat-list-innerList').innerText;
                let template = Handlebars.compile(source);
                const wrapper = {
                    chatRoomList: ajaxWrapper.openRoomList
                };
                result = template(wrapper);
                $('#chat-list > ul > li:first-child').after(result);

                // 채팅방 클릭 이벤트를 붙여준다
                attachRoomClickEvent();

                // 채팅방 리스트를 오픈한다
                chatList.show();
                isListOpen = 1;
            });

        }
    }


    /** Event
     * 열때는 채팅방 리스트만 열고
     * 닫을때는 채팅방 리스트와 (열려있을시) 챗뷰를 함께 닫는다
     */
    chatButton.on('click', function(e){
        toggleChatList();

        if(openedRoomId != null){
            hideChatView();
        }
    });

    /** Event Module
     * 현재 열어놓은 채팅방 아이디와 클릭한 채팅방 아이디 비교해 챗뷰 열지말지 결정
     */
    const attachRoomClickEvent = () => {
        chatRoom = $('#chat-list > ul > li > .chat-room');
        chatRoom.on('click', function(e){

            let clickedRoomId = $(e.target).data('room-id');

            if(openedRoomId == null){
                showChatView(clickedRoomId);
            } else{
                if(openedRoomId != clickedRoomId)
                    showChatView(clickedRoomId);
                else
                    hideChatView();
            }

        });
    }



    /**
     *  Module
     */
    const receiveMessage = (m) => {
        let sender = m.sender;
        let roomId = m.roomId;
        let message = m.message;

        // 열어놓은 채팅방에 메세지가 온 경우
        if (roomId == openedRoomId){
            // 열린 채팅방 화면에 바로 메시지를 붙여준다.
            let li = `<li class="chat-message-oth"><div>${message}</div></li>`
            $('.chat-content > ul > li:last-child').after(li);

            // 현재는 스크롤 내리는 이벤트를 붙였지만, 더 적절한 처리 필요
            let offset = $('.chat-content > ul > li:last-child').position();
            $(".chat-content").animate({scrollTop: offset.top}, 0);
        }

        // 열어놓지 않은 채팅방에 메시지가 온 경우 처리 필요

    }
    const sendMessage = () => {

        // 메시지를 내 화면에 먼저 보여준다
        let message = messageInput.val();
        let li = `<li class="chat-message-my"><div>${message}</div></li>`
        $('.chat-content > ul > li:last-child').after(li);

        // 스크롤을 최하단으로 옮겨 내가 보낸 메시지가 보이게 한다
        let offset = $('.chat-content > ul > li:last-child').position();
        $(".chat-content").animate({scrollTop: offset.top}, 0);


        // websocket을 통해 메시지를 상대방에게 전송한다
        let userId = initData.userData.data.userId;
        let body = {
            sender: userId,
            roomId: openedRoomId,
            message: message
        };
            // 현재는 방번호 (작은id-큰id 형식) 에서 상대 아이디를 뽑아내어 그쪽으로 전송하는 방식
        let lessId = openedRoomId.substring(0,1);
        let greaterId = openedRoomId.substring(2,3);
        let targetId;
        userId == lessId ? targetId = greaterId : targetId = lessId;
        client.send(`/app/send/${targetId}`, {}, JSON.stringify(body));


        // 입력창을 비워준다
        messageInput.val('');
    }

    /** Event
     * 메시지 전송버튼 클릭해 전송
     */
    chatSendBtn.on('click', function(e){
        sendMessage();
    });

    /** Event
     * 엔터키로 전송
     */
    messageInput.on('keydown', function(e){

        if(e.keyCode == 13 && !e.shiftKey) {  // 쉬프트엔터로 개행 가능하도록 예외처리
            e.preventDefault();         // 엔터키가 작성칸에 입력되지 않도록 차단
            sendMessage();
        }

    });



});



