import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HydratedDocument, Types } from 'mongoose';
import { CsvExportCriteria } from '../shared/types/csv-export-criteria';
import { ListCriteria } from '../shared/types/list-criteria.class';
import { BaseRepository } from './base.repository';
import { REQUEST_UNIT_TEST_COLLECTION_NAME, REQUEST_UNIT_TEST_INDEX } from './test-utils/mongodb-search-index.mock';
import { closeInMongodConnection, generateCollectionName, mongooseTestModule } from './test-utils/mongodb-test.mock';

enum Source {
    TMS_DISPATCH = 'TMS_DISPATCH',
    WMS_BOVIS = 'WMS_BOVIS',
    TMS_BOVIS = 'TMS_BOVIS',
}

@Schema()
class LightRequest {
    _id: Types.ObjectId | string;
    @Prop({ type: String, enum: Object.values(Source), required: true })
    source: Source;

    @Prop({ type: String, required: false })
    note: string | null;
}

const lightRequestSchema = SchemaFactory.createForClass(LightRequest);
type LightRequestDocument = HydratedDocument<LightRequest>;

class LightRequestRepository extends BaseRepository<LightRequestDocument, LightRequest> {
    constructor(@InjectModel(LightRequest.name) model) {
        super(model);
    }
}

// -------------------------

@Schema()
class LightUser {
    _id: Types.ObjectId | string;

    @Prop({ type: Boolean, required: true })
    fromSso: boolean;

    @Prop({ type: String, required: true })
    fullName: string;

    @Prop({ type: Date, required: true })
    creationDate: Date;

    @Prop({ type: Number, required: true })
    age: number;
}

// -----------------------------
@Schema()
class SearchRequest {
    _id: Types.ObjectId | string;
    /**
     * RequestId
     */
    @Prop({ type: String, required: true })
    requestId: string;
    /**
     * Type of RequestId
     */
    @Prop({ type: String, required: true })
    requestType: string;
}
const searchRequestSchema = SchemaFactory.createForClass(SearchRequest);
type SearchRequestDocument = HydratedDocument<SearchRequest>;
class SearchRequestRepository extends BaseRepository<SearchRequestDocument, SearchRequest> {
    constructor(@InjectModel(SearchRequest.name) model) {
        super(model);
    }
}

const lightUserSchema = SchemaFactory.createForClass(LightUser);
type LightUserDocument = HydratedDocument<LightUser>;

class LightUserRepository extends BaseRepository<LightUserDocument, LightUser> {
    constructor(@InjectModel(LightUser.name) model) {
        super(model);
    }
}

// eslint-disable-next-line max-lines-per-function
describe('Base repository test', () => {
    let lightRequestRepository: LightRequestRepository;
    let lightUserRepository: LightUserRepository;
    let searchRequestRepository: SearchRequestRepository;

    const lightRequestCollectionName = generateCollectionName();
    const lightUserCollectionName = generateCollectionName();
    const searchRequestCollectionName = REQUEST_UNIT_TEST_COLLECTION_NAME;

    let module: TestingModule;
    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                mongooseTestModule(),
                MongooseModule.forFeature([
                    { name: LightRequest.name, schema: lightRequestSchema, collection: lightRequestCollectionName },
                ]),
                MongooseModule.forFeature([
                    { name: LightUser.name, schema: lightUserSchema, collection: lightUserCollectionName },
                ]),
                MongooseModule.forFeature([
                    { name: SearchRequest.name, schema: searchRequestSchema, collection: searchRequestCollectionName },
                ]),
            ],
            providers: [LightRequestRepository, LightUserRepository, SearchRequestRepository],
        }).compile();

        lightRequestRepository = module.get<LightRequestRepository>(LightRequestRepository);
        lightUserRepository = module.get<LightUserRepository>(LightUserRepository);
        searchRequestRepository = module.get<SearchRequestRepository>(SearchRequestRepository);
    }, 50000);

    // eslint-disable-next-line max-lines-per-function
    describe('Should be able to create, find, update, delete', () => {
        const note1Label = 'my note 1';

        it('Should have working find method', async () => {
            await lightRequestRepository.create({ note: 'Note 1', source: Source.TMS_BOVIS });
            await lightRequestRepository.create({ note: 'Note 2', source: Source.TMS_DISPATCH });
            await lightRequestRepository.create({ note: 'Note 3', source: Source.TMS_DISPATCH });
            let res = await lightRequestRepository.find({ note: 'Note 1' }).exec();
            expect(res.length).toEqual(1);
            expect(res[0].note).toEqual('Note 1');
            res = await lightRequestRepository.find({ source: Source.TMS_DISPATCH }).exec();
            expect(res.length).toEqual(2);
        });

        it('Should have working findOne and findById methods', async () => {
            let res = await lightRequestRepository.findOne({ note: 'Note 1' }).exec();
            expect(res.note).toEqual('Note 1');
            res = await lightRequestRepository.findById(res._id as string).exec();
            expect(res.note).toEqual('Note 1');
        });

        it('Should have working update method', async () => {
            let res = await lightRequestRepository.findOne({ note: 'Note 2' }).exec();
            expect(res.note).toEqual('Note 2');
            await lightRequestRepository.update(res._id as string, { note: 'Note 2 updated' });
            res = await lightRequestRepository.findOne({ note: 'Note 2 updated' }).exec();
            expect(res.note).toEqual('Note 2 updated');
        });

        it('Should be able to find the note 1', async () => {
            await lightRequestRepository.create({ note: note1Label, source: Source.TMS_BOVIS });

            await lightRequestRepository.create({ note: 'my note 2', source: Source.TMS_DISPATCH });
            const rep = await lightRequestRepository.findOne({ note: note1Label }).exec();
            expect(rep.note).toEqual(note1Label);
        });

        it('Update should be effective', async () => {
            await lightRequestRepository.findAndUpdate({ note: note1Label }, { note: 'my note 3' }).exec();
            const rep = await lightRequestRepository.findOne({ note: 'my note 3' }).exec();
            expect(rep.note).toEqual('my note 3');
        });

        it('Delete element should work', async () => {
            const rep = await lightRequestRepository.findOne({ note: 'my note 3' }).lean().exec();
            await lightRequestRepository.delete(rep._id as string);
            expect(await lightRequestRepository.count({ note: 'my note 3' })).toEqual(0);
        });

        it('Should have getByListCriteria method with working pagination', async () => {
            const users: Omit<LightUser, '_id'>[] = [
                { creationDate: new Date('2023-12-17T03:24:00'), fromSso: true, fullName: 'André', age: 10 },
                { creationDate: new Date('2023-12-18T03:24:00'), fromSso: false, fullName: 'Arthur', age: 20 },
                { creationDate: new Date('2023-12-19T03:24:00'), fromSso: false, fullName: 'Louis', age: 30 },
                { creationDate: new Date('2023-12-20T03:24:00'), fromSso: true, fullName: 'Marie', age: 40 },
                { creationDate: new Date('2023-12-21T03:24:00'), fromSso: true, fullName: 'Pierre', age: 50 },
                { creationDate: new Date('2023-12-22T03:24:00'), fromSso: true, fullName: 'Sophia', age: 60 },
                { creationDate: new Date('2023-12-23T03:24:00'), fromSso: true, fullName: 'Xavier', age: 70 },
            ];
            for (const user of users) {
                await lightUserRepository.create(user);
            }
            const criteria = {
                page: 1,
                pageSize: 2,
                search: '',
                sortBy: 'fullName',
                sortOrder: 1,
            };
            const response = await lightUserRepository.getByListCriteria(criteria as ListCriteria, []);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.items = (response.items as any[]).map(({ __v, _id, ...i }) => i);
            expect(response).toEqual({
                items: [
                    { creationDate: new Date('2023-12-17T03:24:00'), fromSso: true, fullName: 'André', age: 10 },
                    { creationDate: new Date('2023-12-18T03:24:00'), fromSso: false, fullName: 'Arthur', age: 20 },
                ],
                totalItems: 7,
            });
        });

        it('Should have getByListCriteria method with working global search', async () => {
            const criteria = {
                page: 1,
                pageSize: 10,
                search: 'IER',
                sortBy: 'fullName',
                sortOrder: 1,
            };
            const searchFields = ['fullName'];
            const response = await lightUserRepository.getByListCriteria(criteria as ListCriteria, searchFields);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.items = (response.items as any[]).map(({ __v, _id, ...i }) => i);
            expect(response).toEqual({
                items: [
                    { creationDate: new Date('2023-12-21T03:24:00'), fromSso: true, fullName: 'Pierre', age: 50 },
                    { creationDate: new Date('2023-12-23T03:24:00'), fromSso: true, fullName: 'Xavier', age: 70 },
                ],
                totalItems: 2,
            });
        });

        it('Should have getByListCriteria method with working filters', async () => {
            const criteria = {
                'page': 1,
                'pageSize': 100,
                'search': '',
                'sortBy': 'fullName',
                'sortOrder': 1,
                'creationDate:from': new Date('2023-12-19T03:24:00'),
                'creationDate:to': new Date('2023-12-22T03:24:00'),
                'fromSso:list': [true],
                'age:max': 50,
                'fullName:search': 'ie',
            };
            const response = await lightUserRepository.getByListCriteria(criteria as ListCriteria, []);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response.items = (response.items as any[]).map(({ __v, _id, ...i }) => i);
            expect(response).toEqual({
                items: [
                    { creationDate: new Date('2023-12-20T03:24:00'), fromSso: true, fullName: 'Marie', age: 40 },
                    { creationDate: new Date('2023-12-21T03:24:00'), fromSso: true, fullName: 'Pierre', age: 50 },
                ],
                totalItems: 2,
            });
        });

        it('Should have getCsvExportData method with working global search', async () => {
            const criteria = {
                search: 'IER',
                sortBy: 'fullName',
                sortOrder: 1,
                columns: ['creationDate', 'fullName', 'fromSso', 'age'],
            };
            const searchFields = ['fullName'];
            let response = await lightUserRepository.getCsvExportData(criteria as CsvExportCriteria, searchFields);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response = (response as any[]).map(({ __v, _id, ...i }) => i);
            expect(response).toEqual([
                { creationDate: new Date('2023-12-21T03:24:00'), fromSso: true, fullName: 'Pierre', age: 50 },
                { creationDate: new Date('2023-12-23T03:24:00'), fromSso: true, fullName: 'Xavier', age: 70 },
            ]);
        });

        it('Should have getCsvExportData method with working column selection', async () => {
            const criteria = {
                search: 'IER',
                sortBy: 'fullName',
                sortOrder: 1,
                columns: ['creationDate', 'fullName'],
            };
            const searchFields = ['fullName'];
            let response = await lightUserRepository.getCsvExportData(criteria as CsvExportCriteria, searchFields);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response = (response as any[]).map(({ __v, _id, ...i }) => i);
            expect(response).toEqual([
                { creationDate: new Date('2023-12-21T03:24:00'), fullName: 'Pierre' },
                { creationDate: new Date('2023-12-23T03:24:00'), fullName: 'Xavier' },
            ]);
        });
    });

    // eslint-disable-next-line max-lines-per-function
    describe('Should able to perform search and autocomplete with ATLAS SEARCH', () => {
        it('Should have a list of request with getList method', async () => {
            const criteria = {
                page: 1,
                pageSize: 2,
                search: 'CDG D1',
                sortBy: 'requestId',
                sortOrder: 1,
            };
            const searchFields = ['requestId', 'requestType'];
            await searchRequestRepository.create({ requestId: 'CDG D1 10000000', requestType: 'Intervention' });
            await searchRequestRepository.create({ requestId: 'ORL D2 20000000', requestType: 'Transport' });
            // Waiting for atlas search to update the index
            await new Promise((r) => setTimeout(r, 5000));
            const response = await searchRequestRepository.getList(
                REQUEST_UNIT_TEST_INDEX,
                criteria as ListCriteria,
                searchFields
            );
            expect(response.totalItems).toEqual(1);
            expect(response.items[0].requestId).toEqual('CDG D1 10000000');
        }, 20000);
        it('Should have a list of suggestions with getAutocompleteSuggestions method', async () => {
            const query = 'CDG D2 1';
            const searchFields = ['requestId', 'requestType'];
            await searchRequestRepository.create({ requestId: 'CDG D2 10000000', requestType: 'Intervention' });
            await searchRequestRepository.create({ requestId: 'CDG D2 11000000', requestType: 'Manutention' });
            await searchRequestRepository.create({ requestId: 'CDG D1 20000000', requestType: 'Transport' });
            await searchRequestRepository.create({ requestId: 'ORL D2 10000000', requestType: 'Manutention' });
            // Waiting for atlas search to update the index
            await new Promise((r) => setTimeout(r, 5000));
            const responses = await searchRequestRepository.getAutocompleteSuggestions(
                REQUEST_UNIT_TEST_INDEX,
                query,
                searchFields
            );
            expect(responses.length).toEqual(2);
            expect(responses[0]).toContain('CDG D2 1');
        }, 20000);
        afterEach(async () => {
            // Remove only all documents but not the collection or the index
            await searchRequestRepository.deleteMany({});
        }, 20000);
    });

    afterAll(async () => {
        await closeInMongodConnection(module, [lightRequestCollectionName, lightUserCollectionName]);
    });
});
