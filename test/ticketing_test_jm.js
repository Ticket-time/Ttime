const Ticketing = artifacts.require('Ticketing');

contract('Ticketing', function(accounts){
    let ticketing;
    let Price = 5 * 10 ** 15;
    beforeEach(async() => {
        ticketing = await Ticketing.new()
    });

    it('should create show', async() => {
        await ticketing.createEvent('BTS', 2020, 3, Price); 
        t = await ticketing.getEventInfo(0);
        assert.equal(t._name, 'BTS');
        assert.equal(t._date, 2020);

        await ticketing.createEvent('Black Pink', 2023, 3, Price); 
        t = await ticketing.getEventInfo(1);
        assert.equal(t._name, 'Black Pink');
    });

    it.only('should issue ticket', async() => {
        await ticketing.issueTicket(0, accounts[1]);
        to = ticketing.getTicketOwner(0, 0);
        assert.equal(to, accounts[0]);
    })
    
})