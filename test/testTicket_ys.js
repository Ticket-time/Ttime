const Ticketing = artifacts.require("Ticketing");

contract("Ticketing", (accounts) => {
  it("tx 내역 불러오기 - 공연 1", async () => {
    const instance = await Ticketing.deployed();
    const price = 10 ** 16 * 4;
    // 1번 공연 - 3개 티켓 발행, 2개 양도
    await instance.issueTicket(1, accounts[3], {
      value: price,
    });
    await instance.issueTicket(1, accounts[2], {
      value: price,
    });
    await instance.issueTicket(1, accounts[1], {
      value: price,
    });
    await instance.resellTicket(1, 1, {
      from: accounts[3],
    });
    await instance.resellTicket(1, 2, {
      from: accounts[2],
    });

    const response = await instance.getResellTicket(1);

    assert.equal(response.length, 2, "양도 티켓 개수가 틀립니다.");
  });

  it("tx 내역 불러오기 - 공연 4", async () => {
    const instance = await Ticketing.deployed();
    const price = 10 ** 16 * 5;
    // 4번 공연 티켓 3개 발행, 3개 양도
    await instance.issueTicket(4, accounts[9], {
      value: price,
    });
    await instance.issueTicket(4, accounts[8], {
      value: price,
    });
    await instance.issueTicket(4, accounts[7], {
      value: price,
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

  it("tx 내역 불러오기 - 공연 3", async () => {
    const instance = await Ticketing.deployed();
    const response = await instance.getResellTicket(3);
    assert.equal(response, false, "거래 내역이 존재합니다.");
  });

  it("resellTicketList 세부 내역 확인", async () => {
    const instance = await Ticketing.deployed();
    await instance.resellTicket(1, 3, {
      from: accounts[1],
    });
    const list = await instance.getResellTicket(1);

    const owner = await list[2].owner;
    assert.equal(owner, accounts[1], "티켓 주인 계정이 다릅니다.");
  });

  it("createShow 공연 생성", async () => {
    const instance = await Ticketing.deployed();
    await instance.createShow(
      2000000000000000,
      "0x43432190d425F0BCeE18F3C0E011D334A8a5f893"
    );
    const showIndex = await instance.showIndex();
    assert.equal(showIndex, 7, "show 생성이 이루어지지 않았습니다.");
  });

  it("getMyTicket", async () => {
    const instance = await Ticketing.deployed();
    const price = 10 ** 16 * 4;
    // 2번 공연 티켓 발행, 1개 양도
    await instance.issueTicket(2, accounts[4], {
      value: price,
    });
    let ticketArray = await instance.getMyTicket(accounts[4]);
    assert.equal(ticketArray.length, 1, "티켓 개수가 맞지 않습니다.");
  });
});
