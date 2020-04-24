
Introduction 
The main purpose of the application is to query hashtags searched on Twitter then analyse the sentiment and display in a graph on screen. 
  
The basic architecture is as follows



The main objective in the development was to ensure the application is elastic, capable of handling varying loads by users in a smooth manner to ensure the user doesn’t feel too much latency while using the app or the app crashing as a whole. 

The application is built on AWS services. For persistence RDS MYSQL database is utilized to ensure streaming data from twitter is never lost in the event of a server crashing. 

The application is broken into three distinct microservices. 

1. User server
The service enables users to request and query twitter hastags and allows users to analyze sentiment score by searching keyword search filters.

2. Twitter Server
The service talks to Twitter’s Stream API, starting streams and destroying streams on user’s requests. The twitter server streams tweets to the analysis server.

3. Analysis server
Most notably the analysis server does much of the computing to generate load.  The analysis server receives tweets from twitter server and saves them in the database. To ensure elasticity the analysis-server scales out and in depending on the varying load. If one fails another one can be generated. This server sits behind a load balancer. 

The twitter stream is distributed by the load balancer and received by analysis servers.




Auto Scaling policy
Step scaling policy is implemented to ensure the application can scale in/out successfully. This policy fits nicely with our solution because it allows to set flags at certain cpu loads that trigger new analysis servers to spin up and ensure the application keeps running smoothly. 

Two flags
1. When the average cpu utilization is greater or equal to 70% two instances are added to distribute overall load.
2. When the average cpu utilization is less or equal to 60% one instance is removed.


Reasons
Upon testing and development it was noticed that the application’s cpu utlization at times increased  dramatically this happened in part due to the number of queries being received by the analysis server and due to the volume of sentiment analysis computation required. The decision to add two more instances after 70% utilization is to scale aggressively if needed to ensure that consistency and availability is achieved at the cost of spending a little more money.

The reason for only removing one instance less than 60% of cpu utilization is to stay conservative and ensure that the application is not scaling in too quickly.



This graph shows when the server hits greater than 70% average cpu utilization two instances are added and therefore the cpu utilization aggressively falls to safe levels.

Technologies
The main technologies used for this project were nodejs for backend developement, pug as a template engine, and css, jquery for the frontend design and development. Mysql database was used for peristence.

The key technology to discuss here is the choice of RDBS over other Databases. The main reason MYSQL was used for this application is because it fits the overall use case I.e. User’s want to analyze sentiment score based on filters. For us, using RDBS is good fit because it gives us the flexibility to our enchance the application with new features such as generating reports of statistics and comparison matrix of filters and sentiment scores in the future if we choose too.

 
# twitter-sentiment-analyzer
