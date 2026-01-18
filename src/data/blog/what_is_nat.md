---
author: Shubham Lad
pubDatetime: 2023-10-24T13:34:33Z
modDatetime: 2023-10-24T13:34:33Z
title: What is NAT?
slug: what-is-nat
featured: false
draft: false
description: A clear explanation of Network Address Translation (NAT)
---

![NAT](https://i.giphy.com/media/l0Hlwi7KzoajIJTI4/giphy.gif)

Network Address Translation (NAT) is a service used in routers to facilitate the translation of one set of IP addresses to another. It serves a vital role in preserving the limited pool of public IPv4 addresses  by assigning single public IP to multiple devices connected to the network. Let's delve into the intricacies of NAT, examining its core types and functions, while exploring its limitations and the emergence of IPv6.

### Limitations of IPv4:

- IPv4, created at a time when the internet's vastness wasn't fully anticipated, engineers didn’t realise how big internet will become.
- There are over 4,294,967,296 public IPv4 addresses. This limitation, with less than one public IP address per person globally, posed significant challenges.

To overcome these challenge, engineers devised the concept of private IP addresses and introduced NAT, revolutionizing network addressing.

### Two types of IP:

**Public:**
	- they are publicly registered
	- You must have public IP to access internet
**Private**
	- They are not publicly registered
	- you can't access internet with this IPs
	- they are reserved for use within local network environments, such as homes and businesses.

In your home or business, you've got lots of devices that want to go online, and for that, they need public IP addresses.

One way to do this is by asking your internet provider for more public IPs, but that can be costly and uses up valuable public IP addresses. In fact, the demand for internet access is much higher than the number of available public IPs, so if we assigned one to each device, we'd quickly run out.

Instead, what we can do is have our router give our devices private IP addresses. When a device needs to go online, a clever system called NAT steps in. It takes our device's private IP and turns it into the public IP given by our internet provider, kind of like a disguise for the internet. This way, our devices can access the internet without using up all the precious public IPs.

NAT handles not only the translation of private to public IP addresses but also the reverse, enabling servers from the internet to communicate with devices within the local network.


### The Future with IPv6:

- In the future we don't need the NAT or private IP addresses. 
- IPv6 is on the horizon and promises to render NAT and private IP addresses obsolete. It provides an astounding 340 undecillion unique IP addresses (that's 36 zeros!). 
- In other words 670 Quadrillion per square millimetre of earth, or 50 Octillion per human alive.
- With IPv6, each device worldwide can have its own public IP, ensuring an abundance of addresses for virtually every purpose.


### Types of NAT:

- Static NAT - This approach establishes a one-to-one mapping, connecting a single private IP to a fixed public IP address. It mirrors the operation of Internet Gateways in cloud services like AWS.
- Dynamic NAT - Dynamic NAT is akin to Static NAT but with a dynamic twist. Devices receive temporary public IPs from a pool, shared among devices without overlap. Depletion of the pool may disrupt internet access.
- Port Address Translation (PAT) - Common in home routers and known as "Overloaded NAT," PAT enables multiple devices to share a single public IP. PAT replaces the source IP and port of outgoing packets with a single public IP and an allocated source port from a pool, enabling IP overloading.

> NOTE: NAT only used for IPv4

Lets understand this by example:

### Static Network Address Translation

![Static NAT](https://res.cloudinary.com/dju7jxioz/image/upload/v1717995039/STATIC_NAT_d5z3sk.png)

- In above diagram where there are devices on the left in a private network and the public network on the right.
- The devices on the left have private IP addresses, which can't be used to send packets directly to the public internet. They need public IP addresses for that.
- On the right, there's Netflix, which has a public IP and is accessible on the public network.
- Now, we have a router (NAT device) that keeps a special list called a NAT table. This table connects private IPs to public IPs in a one-to-one fashion (1:1).
- Let's say your laptop wants to send a packet to Netflix. It creates a packet with its private IP (like 10.0.0.42) as the source and Netflix's public IP as the destination, which it got from DNS.
- This packet goes through our NAT device, which changes the private IP to the public IP and sends it out to Netflix. It's like putting on a disguise for your packet.
- When Netflix responds, it sends a packet with its own public IP as the source and your public IP as the destination.
- When this packet arrives, the NAT device changes the destination back to your private IP. It's like taking off the disguise.
- In services like AWS, this is how Internet Gateways work.

### Dynamic Network Address Translation

![Dynamic NAT](https://res.cloudinary.com/dju7jxioz/image/upload/v1717995040/DYNAMIC_NAT_nwm5xf.png)

- The basic idea is similar to Static NAT, but with a twist. Here, devices don't get permanent public IPs.
- Instead, they receive temporary public IPs from a pool whenever they need to go online.
- In this setup, the router (the NAT device) keeps a table known as the NAT table, which connects private IPs to public IPs.
- Multiple devices can share the same public IP over time as long as their usage doesn't overlap.
- But if the pool of public IPs runs out, devices requesting internet access may face connectivity issues.

### Port Address Translation (PAT)

![PAT](https://res.cloudinary.com/dju7jxioz/image/upload/v1717995040/PAT_wz9gn3.png)

- This is the type of NAT we often find in our home routers.
- It enables a large number of devices to share a single public IP address (MANY: ONE).
- PAT operates similarly to how NATGateway functions.
- Here, the NAT device keeps a record of the source (private) IP and source port of outgoing packets.
- It then replaces the source IP with a single public IP and a public source port allocated from a pool. This process allows for IP overloading, where many private IP addresses are mapped to the same public IP.
- For example, when device1 wants to access Netflix, it creates a packet with a source IP and source port, along with destination IP and destination port.
- The NAT device intercepts this packet, replaces the private IP with the public IP, assigns a public port from the pool, and creates a mapping record in the NAT table.
- Now, this packet can travel on the public network because it has a public IP.
- When Netflix responds, the NAT gateway checks the packet's destination IP and port in the NAT table. When it finds a match, it replaces the destination IP and port with the private IP and port.
- This is how device1 receives the response packet.
- The same process occurs when device2 attempts to connect to the internet. Thanks to the combination of private IPs and ports, PAT efficiently allows numerous devices to share a single IP address, ensuring smooth operation.

### More about PAT

- This is the type of NAT, or Network Address Translation, commonly found in home routers, which allows a large number of devices to share a single public IP address (MANY: ONE). PAT is also known as "overloaded NAT" because it enables multiple private devices to use the same public IP address while distinguishing them based on the source port number.

- In a home network, several devices such as smartphones, laptops, and IoT devices often need to access the internet. However, there's a limited supply of public IP addresses, which are necessary for devices to communicate with servers and services on the global internet. Requesting a unique public IP address for each device would be impractical and would quickly exhaust the available pool of public IP addresses. This is where PAT comes into play.

- PAT works by keeping a record of the source (private) IP address and the source port number for each outgoing packet. When a device within the private network wants to communicate with an external server or service, PAT intercepts the packet and performs two crucial tasks:
    1. It replaces the source IP address of the packet with the single public IP address associated with the home router.
    2. It assigns a unique source port number from a pool of available ports to the packet.

- By using a combination of the private IP address and the unique source port number, PAT distinguishes packets originating from different devices. This allows multiple devices within the private network to share the same public IP address without any conflicts. When a response packet returns from an external server, PAT examines the destination port and, based on the port number, maps the packet to the corresponding device's private IP address and port.

- This efficient use of public IP addresses helps conserve them, especially in home or small business environments where numerous devices require internet access. PAT is the reason why a single public IP address can serve a multitude of devices simultaneously.

- It's important to note that while PAT is commonly used in home routers, it's a specific variation of NAT. NAT (Network Address Translation) is a broader concept that includes various techniques for translating between private and public IP addresses. PAT is particularly effective when a large number of devices need to share a limited pool of public IP addresses.

By using PAT, home networks can optimize their use of public IP addresses, ensuring that all devices can access the internet efficiently without the need for a separate public IP address for each device. This approach is a practical solution to address the limitations of the IPv4 address space and is commonly employed in modern network configurations.