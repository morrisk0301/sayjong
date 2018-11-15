module.exports = {
	server_port: 9948,
    admin_port: 8499,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'user_sj', schemaName:'UserSchema_sj', modelName:'UserModel_sj'},
        {file:'./thread_schema', collection:'thread_sj', schemaName:'ThreadSchema_sj', modelName:'ThreadModel_sj'},
        {file:'./message_schema', collection:'message_sj', schemaName:'MessageSchema_sj', modelName:'MessageModel_sj'},
        {file:'./category_schema', collection:'category_sj', schemaName:'CategorySchema_sj', modelName:'CategoryModel_sj'},
        {file:'./message_counter_schema', collection:'message_counter_sj', schemaName:'MessageCounterSchema_sj', modelName:'MessageCounterModel_sj'},
        {file:'./threadParticipant_schema', collection:'threadparticipant_sj', schemaName:'ThreadParticipantSchema_sj', modelName:'ThreadParticipantModel_sj'},
        {file:'./categoryParticipant_schema', collection:'categoryparticipant_sj', schemaName:'CategoryParticipantSchema_sj', modelName:'CategoryParticipantModel_sj'},
        {file:'./admin_schema', collection:'admin_sj', schemaName:'AdminSchema_sj', modelName:'AdminModel_sj'},
        {file:'./notice_schema', collection:'notice_sj', schemaName:'NoticeSchema_sj', modelName:'NoticeModel_sj'},
        {file:'./banner_schema', collection:'banner_sj', schemaName:'BannerSchema_sj', modelName:'BannerModel_sj'},
        {file:'./ban_schema', collection:'ban_sj', schemaName:'BanSchema_sj', modelName:'BanModel_sj'},
        {file:'./user_ban_schema', collection:'user_ban_sj', schemaName:'UserBanSchema_sj', modelName:'UserBanModel_sj'},
        {file:'./thread_ban_schema', collection:'thread_ban_sj', schemaName:'ThreadBanSchema_sj', modelName:'ThreadBanModel_sj'}
	],
};