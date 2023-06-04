const Ticket = artifacts.require("Ticket");
// const { isTopic } = require("web3-utils");

// 확인해야 하는 것
// 구매자 - 티켓 셀러 간 송금 제대로 되는지
contract("test", (accounts) => {
  it.only("응모 성공", async () => {
    const ticketInstance = await Ticket.deployed({
      from: accounts[0],
      value: 37000000000000000,
    });
    await ticketInstance.book({ from: accounts[0] });
    await ticketInstance.book({ from: accounts[1] });
    await ticketInstance.book({ from: accounts[2] });
    await ticketInstance.book({ from: accounts[3] });
    await ticketInstance.book({ from: accounts[4] });
    await ticketInstance.book({ from: accounts[5] });
    await ticketInstance.book({ from: accounts[6] });
    await ticketInstance.book({ from: accounts[7] });
    await ticketInstance.book({ from: accounts[8] });
    applicantList = await ticketInstance.get();
    assert.equal(applicantList.length, 9, "응모자 수 불일치");
  });
  it("random() 성공", async () => {
    const ticketInstance = await Ticket.deployed({
      from: accounts[0],
      value: 37000000000000000,
    });
    await ticketInstance.book({ from: accounts[0] });
    await ticketInstance.book({ from: accounts[1] });
    await ticketInstance.book({ from: accounts[2] });
    await ticketInstance.book({ from: accounts[3] });
    await ticketInstance.book({ from: accounts[4] });
    await ticketInstance.book({ from: accounts[5] });
    await ticketInstance.book({ from: accounts[6] });
    await ticketInstance.book({ from: accounts[7] });
    await ticketInstance.book({ from: accounts[8] });

    await ticketInstance.random();

    const seatList = await ticketInstance.getSeats();

    var arr = new Array(9);
    arr.fill(0);
    for (var i = 0; i < 3; i++) {
      num = seatList[i];
      arr[num]++;
    }
    var randomCheck = true;
    for (var i = 0; i < 9; i++) {
      if (arr[i] > 1) {
        randomCheck = false;
      }
    }
    assert.equal(randomCheck, true, "random 함수 중복 할당");
  });
  it("buyTicket() 성공", async () => {
    const ticketInstance = await Ticket.deployed({
      from: accounts[0],
      value: 37000000000000000,
    });

    const buyer = accounts[0];
    const seller = accounts[9];
    const value = 37000000000000000;

    const sellerStartingBalance = await web3.eth.getBalance(seller);

    // [0] 계정이 컨트랙트에 송금
    // 컨트랙트에서 [9] 계정으로 다시 송금
    // [0] -> contract -> [9]
    await ticketInstance.buyTicket(seller, { from: buyer });

    const sellerEndingBalance = await web3.eth.getBalance(seller);

    assert.equal(
      sellerEndingBalance,
      sellerStartingBalance + value,
      "Amount wasn't correctly sent to the receiver"
    );
  });
});