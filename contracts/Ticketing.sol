// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Ticketing {
    address payable owner; // 앱 관리자     

    constructor() payable {
        owner = payable(msg.sender);
    }

    mapping(address => uint[]) public bookingIdList;   // 예매 번호 리스트  사용자 지갑 주소 => 예매 번호 리스트
    mapping(uint => Ticket) public ticketForBookingId;  // 예매 번호에 대한 티켓   예매 번호 => 티켓 
    
    mapping(uint => uint[]) public sellingBookingIdList; // showid => 해당 공연에서 거래 중인 예매 번호 리스트  공연 번호 => 예매 번호 리스트 

    enum TicketStatus {
        Sold,   // 판매 완료
		Canceled, // 취소표
        OnSale,  // 양도표
        Expired  // 공연 날짜 지나서 폐기됨
    }

     // 예매 개념 - 누가, 어떤 공연을, 몇장, 좌석, 상태(판매 중인지 등)
    struct Ticket {
        uint bookingId;
        address payable owner;
        string userId;
        uint showId;
        uint numberOfSeats;
        //string[] seatList;   그냥 좌석 이름만 저장해도 ㄱㅊ을거 같지만 일단 보류
        uint price;
        TicketStatus status;  
        uint indexForBookingIdList;  
        uint indexForSellingBookingIdList; // 쓰읍;;;시발 
    }

    function getMyTicket(address payable userAddr) public view returns(Ticket[] memory){
        uint length = bookingIdList[userAddr].length;
        Ticket[] memory myTickets = new Ticket[](length);

        for(uint i = 0; i < length; i++){
            uint bookingId = bookingIdList[userAddr][i];
            myTickets[i] = ticketForBookingId[bookingId];
        }
   
        return myTickets;
    }

    function getResellTicket(uint _showId) public view returns(Ticket[] memory) {
        
        uint size = sellingBookingIdList[_showId].length;
        Ticket[] memory resellTicketList = new Ticket[](size);

        for(uint i = 0; i < size; i++) {
            uint bookingId = sellingBookingIdList[_showId][i];
            resellTicketList[i] = ticketForBookingId[bookingId];
        }

        return resellTicketList;
    }

    uint public bookingID = 1; 

    event ISSUE_TICKET(uint indexed _showId, uint indexed _bookingId, uint indexed _numberOfSeats);
    function issueTicket(uint _showId, address payable _ticketOwner, uint _numberOfSeats, string calldata _userId) public payable {

        Ticket memory ticket = Ticket({
            bookingId: bookingID,
            owner: _ticketOwner,
            userId: _userId,
            showId: _showId,
            numberOfSeats: _numberOfSeats,
            price: msg.value,
            status: TicketStatus.Sold,
            indexForBookingIdList: 0,
            indexForSellingBookingIdList: 0
        });

        owner.transfer(msg.value);  // 공연 주인에게 티켓값 지불

        bookingIdList[_ticketOwner].push(bookingID);
        ticketForBookingId[bookingID] = ticket;

        uint index = bookingIdList[_ticketOwner].length - 1;
        ticketForBookingId[bookingID].indexForBookingIdList = index;

        emit ISSUE_TICKET(_showId, bookingID, _numberOfSeats);

        bookingID++;
    }



    function removeFromUser(uint _bookingId) public{
        address payable _refunder = ticketForBookingId[_bookingId].owner;
        uint _index = ticketForBookingId[_bookingId].indexForBookingIdList;
        
        require(_index < bookingIdList[_refunder].length, "index out of bound");

        for(uint i = _index; i < bookingIdList[_refunder].length - 1; i++){
            bookingIdList[_refunder][i] = bookingIdList[_refunder][i + 1];
        }
        bookingIdList[_refunder].pop();
    }

    function getTicketForBookingId(uint _bookingId) public view returns(Ticket memory){
        return ticketForBookingId[_bookingId];
    }

    function refund(address payable _refunder, uint _refundRatio) public payable {
        uint refundPrice = msg.value * _refundRatio / 100;
         _refunder.transfer(refundPrice);
    }

    // @ 양도표 판매자에게 돈 송금
    function pay(uint _bookingId) public payable {
        address payable oldOwner = ticketForBookingId[_bookingId].owner;
        oldOwner.transfer(msg.value);
    }

    //양도 = 거래탭에 올리겠다는 함수
    event RESELL(uint indexed _showId, uint indexed _bookingId);
    function resellTicket(uint _showId, uint _bookingId) public { 
        sellingBookingIdList[_showId].push(_bookingId);

        // 티켓 상태 변경
        ticketForBookingId[_bookingId].status = TicketStatus.OnSale;
        ticketForBookingId[_bookingId].indexForSellingBookingIdList = sellingBookingIdList[_showId].length - 1;

        emit RESELL(_showId, _bookingId);
    }


    function removeFromShow(uint _index, uint _showId) public{
        require(_index < sellingBookingIdList[_showId].length, "index out of bound");

        for(uint i = _index; i < sellingBookingIdList[_showId].length - 1; i++){
            sellingBookingIdList[_showId][i] = sellingBookingIdList[_showId][i + 1];
        }
        sellingBookingIdList[_showId].pop();
    }

    // 거래탭에서 티켓 구매
    function changeTicketInfo(address _buyer, string calldata _userId, uint _bookingId) public payable {
        
        Ticket storage ticket = ticketForBookingId[_bookingId];

        // 1. buyer의 예매 번호 리스트에 추가
        bookingIdList[_buyer].push(_bookingId);       

        // 2. 티켓 정보 변경 
        ticket.owner =  payable (_buyer);
        ticket.userId = _userId;
        ticket.status = TicketStatus.Sold;  // 이후 양도표로

        uint index = bookingIdList[_buyer].length - 1;
        ticket.indexForBookingIdList = index;

        // 4. selling List에서 삭제 
        index = ticket.indexForSellingBookingIdList;
        removeFromShow(index, ticket.showId);
    }
    
    // 양도 중 취소
    function cancelReselling(uint _bookingId) public {
        Ticket storage ticket = ticketForBookingId[_bookingId];
        // selling List 에서 삭제
        uint index = ticket.indexForSellingBookingIdList;
        removeFromShow(index, ticket.showId);
        // ticket 상태 변경
        ticket.status = TicketStatus.Sold;
        ticket.indexForSellingBookingIdList = 0;
    }






    // // 일반 예매 취소
    // function cancelForBasic (uint _bookingId, uint _refundRatio) public payable {
    //     uint index = ticketForBookingId[_bookingId].indexForBookingIdList;

    //     removeFromUser(index, msg.sender);
    //     refund(payable(msg.sender), _refundRatio, {from: owner});
    // }


    // // 추첨제 취소
    // function cancelForLottery (uint _bookingId, uint _refundRatio) public payable {
    //     uint index = ticketForBookingId[_bookingId].indexForBookingIdList;
    //     uint showId = ticketForBookingId[_bookingId].showId;

    //     removeFromUser(index, msg.sender);
    //     refund(payable(msg.sender), _refundRatio, {from: owner});
    //     resellTicket(showId, _bookingId);
    // }

    // // 추첨제 취소표 구매 
    // function buyTicketForCancelLottery (string calldata _userId, uint _bookingId) public payable {
    //     uint price = ticketForBookingId[_bookingId].price;
    //     owner.transfer(price);
    //     changeTicketInfo(msg.sender, _userId, _bookingId);
    // }


    // // 양도
    // function handOver (uint _bookingId) public payable {
    //     uint showId = ticketForBookingId[_bookingId].showId;
    //     resellTicket(showId, _bookingId);
    // }


    // // 양도 티켓 구매
    // function buyTicketForHandOver (string calldata _userId, uint _bookingId) public payable {
    //     uint index = ticketForBookingId[_bookingId].indexForBookingIdList;
    //     address payable oldOwner = ticketForBookingId[_bookingId].owner;

    //     removeFromUser(index, oldOwner);
    //     uint price = ticketForBookingId[_bookingId].price;
    //     oldOwner.transfer(price);
    //     changeTicketInfo(msg.sender, _userId, _bookingId);
    // }

}