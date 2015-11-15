## Install ElasticSearch with Docker

If `Mac OS X` use Docker. DockerTools.
Run the elasticsearch container:
`docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch elasticsearch:2.0.0 -Des.node.name="Node01" -Des.network.host=0.0.0.0`

Link: http://stackoverflow.com/a/25321473

## Create Index

`curl -XPUT 'http://localhost:9200/cities/'`

Check if Index exists:
`curl -XHEAD -i 'http://localhost:9200/cities'`

Create mapping:
`curl -XPUT 'http://192.168.99.100:9200/_mapping/cities' -d '{"properties":{"name":{"type":"string"},"lat":{"type":"string"},"lng":{"type":"string"}}}'`
