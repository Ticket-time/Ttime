// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ticketing {
    address payable owner; // 앱 관리자 
    uint public showIndex; // 공연 id
    uint public userIndex; 
    uint public sellingQueueIndex;

    mapping(uint => Show) public shows;
    mapping(address => Ticket[]) public myTicket; // 소비자용
    mapping(address => Show[]) public myShow; // 공연 관계자용
    mapping(uint => Ticket) sellingQueue; // 양도 티켓 매물 정보

    constructor() payable {
        owner = payable(msg.sender);
        createEvent('sowonFanmeeting', 20230602, 2, 100000);
    }

    struct Ticket {
        uint ticketId;
        uint showId;
        address payable owner;
    }

    struct Show {
        address payable owner; // 공연 관계자
        uint showId;
        mapping(uint => Ticket) tickets; // ticket 정보
    }

    event CREATE_SHOW(
        uint indexed _showId,
        string _name,
        uint _date,
        uint _totalNumOfSeat,
        uint _ticketPrice
    );


    event ISSUE_TICKET(uint _showId, uint _ticketId);

    /// @notice 송금 이벤트 
    // event Transfer (address indexed buyer, uint value);

    /// @notice 티켓 재판매 등록 이벤트
    event RESELL(address _owner, uint _showId, uint _ticketId);

    /// @notice 티켓 구매 이벤트 
    event BUY_TICKET(address from, address to, uint _ticketPrice);

    
    function createEvent(
        string memory _name,
    ) public returns (bool sufficient){
        Show storage s = shows[showIndex];
        s.owner = payable(msg.sender);
        s.name = _name;
        s.date = _date;
        s.totalNumOfSeat = _totalNumOfSeat;
        s.ticketPrice = _ticketPrice;
        s.ticketIndex = 0;

        emit CREATE_SHOW(showIndex, _name, _date, _totalNumOfSeat, _ticketPrice);
        showIndex++;
        return true;
    }

    /// @notice 공연에 응모
    function book() public { // 해당 공연에 응모
        Show storage s = shows[showIndex];

        // 유저 정보 입력...
        User storage u = users[msg.sender];
        u.userAddr = msg.sender;
        u.haveTickets[showIndex] = false;

        s.applicantList.push(msg.sender);
		emit Book(msg.sender);
	}

    /// @notice 응모자 중 당첨자를 뽑기 위한 랜덤 함수
    function random() public {
        Show storage s = shows[showIndex];
        // 응모 기간 지난 후에 함수 실행
        // users 배열 인덱스에서 좌석 수 만큼 for문 돌리기
        // uint num = showList[0].totalNumOfSeat;
        uint showId = s.showId;
        uint ticketNum = shows[showId].totalNumOfSeat;
        uint applicantNum = s.applicantList.length;
        uint randNonce = 0;
        uint value;
        address winner;
        for (uint i = 0; i < ticketNum; i++) {
            randNonce ++;
            // 이미 나왔던 값인 경우 새로 값 나올때까지 진행
            // 유저 수 범위 내로 돌려서, 순서대로 좌석 할당
            do {
                value = uint(keccak256(abi.encodePacked(block.timestamp,msg.sender,randNonce))) % applicantNum;
                winner = s.applicantList[value]; // 해당 주소
            } while(users[winner].haveTickets[showId] == true); // 중복 여부
            
            // seats.push(winner); seat가 당첨자배열이었음
            s.winnerList.push(winner);
            users[winner].haveTickets[showId] = true;
        }
    }

     /// @notice 티켓을 응모한 사람 중 당첨된 사람한테 발급
    function issueTicket(uint _showId, address payable _owner) public payable{
        Show storage s = shows[_showId];
        require(users[msg.sender].haveTickets[showIndex] == true, "don't have ticket"); // 당첨자인지 확인

       

        emit ISSUE_TICKET(s.showId, s.ticketIndex);
        s.ticketIndex++;

        (s.owner).transfer(msg.value);
    }

    /// @notice 티켓 재판매 (or 양도) 등록 함수
    function resellTicket(uint _showId, uint _ticketId) public {
        Show storage s = shows[_showId];

        // 티켓 소유 여부 확인
        require(
            msg.sender == s.tickets[_ticketId].owner,
            "You don't have the ticket"
        );

        // 티켓을 셀링큐에 넣음 => 해당 공연에 대한 리셀 티켓 확인 가능
        sellingQueue[sellingQueueIndex] = s.tickets[_ticketId];
        sellingQueueIndex++;

        emit RESELL(msg.sender, _showId, _ticketId);
    }

    function buyTicket(uint _sellingQueueIndex) public payable {
        Ticket memory t = sellingQueue[_sellingQueueIndex];
        Show storage s = shows[t.showId];
        address payable seller = t.owner;

        require(msg.value == s.ticketPrice, "Not enough ETH!");
        // 티켓 기한 만료 확인 require();

        // 송금 
        seller.transfer(msg.value);
        emit BUY_TICKET(msg.sender, seller, s.ticketPrice);
        delete sellingQueue[_sellingQueueIndex];
    }

    function getShowInfo(
        uint _showId
    ) public view returns (string memory _name, uint _date) {
        Show storage s = shows[_showId];
        _name = s.name;
        _date = s.date;
    }

    function getTicketOwner(
        uint _showId,
        uint _ticketId
    ) public view returns (address) {
        return shows[_showId].tickets[_ticketId].owner;
    }

    function getApplicantList() public view returns (address[] memory) {
        return shows[showIndex].applicantList;
    }

    function getSeats() public view returns (address[] memory) {
        return shows[showIndex].winnerList;
    }

    // function getAllTickets() public {

    // }

    // function getAllEvents() public view returns (Show[] memory) {
    //     Show[] memory allEvents = new Show[](numEvents);
    //     uint256 count = 0;
    //     for (uint256 i = 0; i < numEvents; i++) {
    //             allEvents[count] = shows[i];
    //             count++;
    //         }
    //     return allEvents;
    // }

    // 내 티켓 (유저) -> 누르면 티켓, 공연 정보 나오잖음
    // 내 공연??? (공연 주최자?)
    
}
