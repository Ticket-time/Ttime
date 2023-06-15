// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ticketing {
    address payable owner; // 앱 관리자 
    uint public showIndex = 1; // 공연 id 1부터 시작
    uint public userIndex; 
    uint public sellingQueueIndex;

    mapping(uint => Show) public shows; // 전체 공연 목록
    mapping(address => Ticket[]) public myTicket; // 소비자용
    mapping(address => Show[]) public myShow; // 공연 관계자용

    constructor() payable {
        owner = payable(msg.sender);
        createShow(40000000000000000, 0x82b162f01A49d96999e7563949cC738a4928e7EF);   //약 88000
        createShow(40000000000000000, 0x82b162f01A49d96999e7563949cC738a4928e7EF);    
        createShow(50000000000000000, 0x5053f90D21c8E15471c30Cb3c065A230E1BaeB09);  // 약 11만 
        createShow(50000000000000000, 0x5053f90D21c8E15471c30Cb3c065A230E1BaeB09);
        createShow(60000000000000000, 0x43432190d425F0BCeE18F3C0E011D334A8a5f893);  // 약 13만 
    }

    struct Ticket {
        uint showId;
        uint ticketId;
        address payable owner;
    }

    struct Show {
        address payable owner; // 공연 주최측
        uint ticketIndex;
        uint ticketPrice;
        mapping(uint => Ticket) tickets; // ticket 정보
        mapping(uint => Ticket) sellingQueue; // 양도 티켓 큐
        uint sellingQueueIndex;
    }

    event ISSUE_TICKET(uint indexed _showId, uint indexed _ticketId);

    /// @notice 송금 이벤트 
    event TRANSFER (address indexed sender, uint value, address receiver);

    /// @notice 티켓 재판매 등록 이벤트
    event RESELL(address _owner, uint _showId, uint _ticketId);

    /// @notice 티켓 구매 이벤트 
    event BUY_TICKET(address from, address to, uint _ticketPrice);

    function getTicketPrice (uint _showid) public view returns (uint ticketPrice){
        return shows[_showid].ticketPrice;
    }

    function getMyTicket (address userAddr) public view returns (Ticket[] memory ){
        return myTicket[userAddr];
    }

    /// @notice 송금
    function transferWei (uint _ticketPrice, address payable receiver) public payable{
        address sender = msg.sender;
        receiver.transfer(_ticketPrice);
        // receiver.transfer(msg.value);
        emit TRANSFER(sender, _ticketPrice, receiver);
    }

    /// @notice 공연 생성
    function createShow(uint _ticketPrice, address _showOwner) public returns (bool sufficient){
        Show storage s = shows[showIndex];
        // 공연 주최측 지갑 주소 받아오는 부분 추후 구현
        // s.owner = payable(msg.sender);
        s.owner = payable(_showOwner);
        s.ticketIndex = 1;
        s.sellingQueueIndex = 0;
        s.ticketPrice = _ticketPrice;
        showIndex++;
        return true;
    }

     /// @notice 티켓을 응모한 사람 중 당첨된 사람한테 발급
    function issueTicket(uint _showId, address payable _ticketOwner) public payable{
        Show storage s = shows[_showId];
        Ticket memory t = Ticket({
            showId: _showId,
            ticketId: s.ticketIndex,
            owner: _ticketOwner
        });
        transferWei(msg.value, s.owner); // 결제 해야 발급
        // transferETH(s.ticketPrice, s.owner);

        s.tickets[s.ticketIndex] = t;
        myTicket[msg.sender].push(t);

        emit ISSUE_TICKET(_showId, s.ticketIndex);
        s.ticketIndex++;
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
        s.sellingQueue[s.sellingQueueIndex] = s.tickets[_ticketId];
        s.sellingQueueIndex++;

        emit RESELL(msg.sender, _showId, _ticketId);
    }

    /// @notice 셀링큐에서 티켓 양도 받음
    function buyTicket(uint _showId, uint _sellingQueueIndex) public payable {
        Show storage s = shows[_showId];
        Ticket memory t = s.sellingQueue[_sellingQueueIndex];
        
        address payable seller = t.owner;

        // require(msg.value == s.ticketPrice, "Not enough ETH!");
        // 티켓 기한 만료 확인 require();

        // 송금 
        transferWei(msg.value, seller);
        emit BUY_TICKET(msg.sender, seller, msg.value);
        delete s.sellingQueue[_sellingQueueIndex];
    }

}
