package main

import (
	"fmt"
	"log"
	"menteslibres.net/gosexy/redis"
	"strings"
	"time"
	"regexp"
	"encoding/json"
)

func timer() {
	for {
		fmt.Println("Timer")
		time.Sleep(5000000000)	
	}
}


func reply_string(msg Message) string {

	s := []string{msg.id_pipeline, msg.id_expression, "eval", "null", "0", "0", msg.tunnel, "go", msg.from, msg.to, msg.message}
	s2 := strings.Join(s, ":")

	return s2
}


func pub(red * redis.Client, msg Message) {

	s := reply_string(msg)
	red.Publish("dbot:reply", s)
}


type Config struct {
	whoami string
	publisher * redis.Client
	subscriber * redis.Client
}

    type Message struct {
        id_pipeline string
        id_expression string
		_type string
		opts string
		ts_user string
		ts_sys string
        tunnel string
        listener string
        from string
        to string
        channel string
        message string
    }




func main() {

	c := Config{whoami:"go"}

	c.publisher = redis.New()
	
	err := c.publisher.ConnectNonBlock("127.0.0.1", 6379)
	if err != nil {
		log.Fatalf("[Publisher] Connect failed: %s\n", err.Error())
		return
	}

	c.subscriber = redis.New()

	err = c.subscriber.ConnectNonBlock("127.0.0.1", 6379)
	if err != nil {
		log.Fatalf("[Subscriber] Connect failed: %s\n", err.Error())
		return
	}

	rec := make(chan []string)
	go c.subscriber.Subscribe(rec, "dbot:eval")
	go c.subscriber.Subscribe(rec, "dbot:go")
	
	var ls []string
	for {
		ls = <-rec

		msg := strings.Join(ls,", ")

    comp2 := regexp.MustCompile(`:`)
    v2 := comp2.Split(msg,12)

	if len (v2) < 12 {
		continue
	}

    message := Message{}
    message.id_pipeline = v2[1]
    message.id_expression = v2[2]
	message._type = v2[3]
	message.opts = v2[4]
	message.ts_user = v2[5]
	message.ts_sys = v2[6]
    message.tunnel = v2[7]
    message.listener = v2[8]
    message.from = v2[9]
    message.to = v2[10]
    message.message = v2[11]


	pipeline_comp := regexp.MustCompile(` `)
	pipeline_comp_val := pipeline_comp.Split(message.id_pipeline, 2)
	message.id_pipeline = pipeline_comp_val[1]
	

    b := []byte(message.message)
    var z []interface{}
    err := json.Unmarshal(b, &z)

    if err != nil {
		continue
    }

	switch z[0] {
		default : continue
		case "e" : {
			break
		} 
		case "ping" : {
			message.message = "pong"
			go pub(c.publisher, message)
			break
		}
		case "vping" : {
			message.message = "go"
			go pub(c.publisher, message)
			break
		}
	}


	}
	

	fmt.Println("Quitting")

	c.subscriber.Quit()
	c.publisher.Quit()
}
