Homee Messenger Bot  
Make sure database accepts SSL connections  
/webhook/:uid get requests retrieve data stored in database where :uid is the id of the user  
/webhook get requests are used for facebook verification  
/webhook post requests are sent from the facebook messenger  
environment variables:  
DATABASE_URL is set to the url for the postgresql database being used  
PAGE_ACCESS_TOKEN is set to access token for the facebook page being used  
PAGE_ID is set to the id of the facebook page  
VERIFY_TOKEN is set to the verification token for the page  

