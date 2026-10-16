' Prints every key the simulator delivers, so a test can read what reached the channel.
sub main()
    port = CreateObject("roMessagePort")
    screen = CreateObject("roScreen")
    screen.SetMessagePort(port)

    print "ready"

    while true
        msg = wait(0, port)
        if type(msg) = "roUniversalControlEvent"
            print "key "; msg.GetInt()
        end if
    end while
end sub
