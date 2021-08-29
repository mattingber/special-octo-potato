
import { DigitalIdentityRepository } from './../../digitalIdentity/repository/DigitalIdentityRepository';
import { EntityRepository } from '../repository/EntityRepository';
import { EntityService } from './EntityService';
// import { NotificationsSpy } from './notificationSpy';
import { createMock } from 'ts-auto-mock';

describe('makeOffer', () => {
  describe(`Given a vinyl exists and is available for trade`, () => {
    describe(`When a trader wants to place an offer using money`, () => {
      test(`Then the offer should get created and an email should be sent to the vinyl owner`, async () => {

        // Arrange
        let mockEntitiesRepo = createMock<EntityRepository>();
        let mockDIsRepo = createMock<DigitalIdentityRepository>();
        // let notificationsSpy = new NotificationsSpy();
        let entityService = new EntityService(
            mockEntitiesRepo,
            mockDIsRepo,
        );

        // Act
        let result = await entityService.createEntity({
            "firstName": "noam",
            "lastName": "s",
            "entityType": "civilian",
            "identityCard": "316127711",
            "serviceType": "hov"
        });
        console.log((result as any).value)
        // Assert 
        expect(result.isOk()).toBeTruthy();                    
        expect(mockEntitiesRepo.save).toHaveBeenCalled();       
        // expect(notificationsSpy.getEmailsSent().length).toEqual(1); 
        // expect(notificationsSpy.emailWasSentFor())
        //   .toEqual(result.getValue().offerId);                     
      });
    });
  });
});