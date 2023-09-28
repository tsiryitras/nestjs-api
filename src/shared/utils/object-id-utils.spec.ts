import { isMongoDbObjectId } from './objecct-id.utils';

describe('object id utils', () => {
    it('Should return correct mongo db object id', () => {
        const objectId = '60dd836130795f3aac55f0c9';
        const result = isMongoDbObjectId(objectId);
        expect(result).toEqual(true);
    });
});
