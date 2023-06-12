// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ticketing {
    address payable owner; // 앱 관리자 
    uint public showIndex = 1; // 공연 id
    uint public sellingQueueIndex;

    mapping(uint => Show) public shows; // 전체 공연 목록
    mapping(address => Ticket[]) public myTicket; // 소비자용
    mapping(address => Show[]) public myShow; // 공연 관계자용
    mapping(uint => Ticket) public sellingQueue; // 양도 티켓 매물 정보

    constructor() payable {
        owner = payable(msg.sender);
        createShow(); // 1
        createShow(); // 2
        createShow(); // 3
        createShow(); // 4
        createShow(); // 5
    }

    struct Ticket {
        uint showId;
        uint ticketId;
        address payable owner;
    }

    struct Show {
        address payable owner; // 공연 관계자
        //uint showid;
        uint ticketIndex; // 티켓 개수 세는 용도
        uint ticketPrice;
        mapping(uint => Ticket) tickets; // ticket 정보
    }

    event ISSUE_TICKET(uint _showId, uint _ticketId);

    /// @notice 송금 이벤트 
    // event Transfer (address indexed buyer, uint value);

    /// @notice 티켓 재판매 등록 이벤트
    event RESELL(address _owner, uint _showId, uint _ticketId);

    /// @notice 티켓 구매 이벤트 
    event BUY_TICKET(address from, address to, uint _ticketPrice);

    function createShow() public returns (bool sufficient){
        Show storage s = shows[showIndex];
        s.ticketIndex = 0;
        showIndex++;
        return true;
    }
     /// @notice 티켓을 응모한 사람 중 당첨된 사람한테 발급
    function issueTicket(uint _showId, address payable _owner) public payable{
        Show storage s = shows[_showId];
        Ticket memory t = Ticket({
            showId: _showId,
            ticketId: s.ticketIndex,
            owner: _owner
        });

        s.tickets[s.ticketIndex] = t;
        myTicket[_owner].push(t);

        emit ISSUE_TICKET(_showId, s.ticketIndex);
        s.ticketIndex++;
        // (s.owner).transfer(msg.value);
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

        // require(msg.value == s.ticketPrice, "Not enough ETH!");
        // 티켓 기한 만료 확인 require();

        // 송금 
        seller.transfer(msg.value);
        emit BUY_TICKET(msg.sender, seller, s.ticketPrice);
        delete sellingQueue[_sellingQueueIndex];
    }

}

