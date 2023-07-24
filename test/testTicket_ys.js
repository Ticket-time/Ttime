const Ticketing = artifacts.require("Ticketing");
// const { isTopic } = require("web3-utils");

contract("Ticketing", (accounts) => {
  it("공연1 거래 내역 불러오기", async () => {
    const instance = await Ticketing.deployed();
    // 1번 공연 - 3개 티켓 발행
    await instance.issueTicket(1, accounts[3], {
      value: 4000000000000000, // 너무 큰 수
    });
    await instance.issueTicket(1, accounts[2], {
      value: 4000000000000000,
    });
    await instance.issueTicket(1, accounts[1], {
      value: 4000000000000000,
    });
    await instance.resellTicket(1, 1, {
      from: accounts[3],
    });
    await instance.resellTicket(1, 2, {
      from: accounts[2],
    });
    const response = await instance.getResellTicket(1);
    const num = response.length;
    assert.equal(num, 2, "양도 티켓 개수가 틀립니다.");
  });

  it("공연4 거래 내역 불러오기", async () => {
    const instance = await Ticketing.deployed();
    await instance.issueTicket(4, accounts[9], {
      value: 1000000000000000,
    });
    await instance.issueTicket(4, accounts[8], {
      value: 1000000000000000,
    });
    await instance.issueTicket(4, accounts[7], {
      value: 1000000000000000,
    });
    await instance.resellTicket(4, 3, {
      from: accounts[7],
    });
    await instance.resellTicket(4, 2, {
      from: accounts[8],
    });
    await instance.resellTicket(4, 1, {
      from: accounts[9],
    });
    const response = await instance.getResellTicket(4);
    assert.equal(response.length, 3, "양도 티켓 개수가 틀립니다.");
  });

  it("공연3 거래 내역 불러오기", async () => {
    const instance = await Ticketing.deployed();
    const response = await instance.getResellTicket(3);
    assert.equal(response, false, "거래 내역이 존재합니다.");
  });

  it("resellTicketList 세부 내역 확인", async () => {
    const instance = await Ticketing.deployed();
    const f = await instance.resellTicket(1, 3, {
      from: accounts[1],
    });
    const list = await instance.getResellTicket(1);

    const owner = await list[2].owner;
    assert.equal(owner, accounts[1], "티켓 주인 계정이 다릅니다.");
  });
});
