// SPDX-License-Identifier: UNLICENCED
pragma solidity >=0.6.6 <0.7.0;

import "./ResturantToken.sol";
import "./Queue.sol";

contract CuratedResturant{
    
    ResturantToken public resturantToken;
    Queue public resturantQueue;
    
    struct Resturant{
        string name;
        string website;
        string location;
        uint8 foodQuality;
        uint8 service;
        uint8 ambience;
    }
    
    string category="resturants";
    
    mapping (string => mapping (address => bool)) alreadyVoted;
    
    mapping (string => uint) public deadlineTime;
    
    mapping (string => Resturant) public pendingResturants;
    
    mapping (string => Resturant) public approvedResturants;
    
    string [] public approvedList;
    
    uint public lengthOfApprovedList;
    
    mapping (string => uint ) public deposit;
        
    mapping (string => address) public applicant; 
    
    mapping (string => uint ) public challengerDeposit;
        
    mapping (string => address) public challenger;
    
    mapping (string => uint)  numVotesFor;
    
    mapping (string => uint)  numVotesAgainst;
    
    mapping (string => address [])  votersFor;
    
    mapping (string => address [])  votersAgainst;
    
    constructor(ResturantToken _resturantToken ,Queue _resturantQueue)public{
        resturantToken=_resturantToken;
        resturantQueue=_resturantQueue;
    }
    
    function sendApplication(uint _tokens,string memory _name,string memory _website,string memory _location,uint8 _foodQuality,uint8 _service,uint8 _ambience) public returns(bool){
        require(applicant[_name] == address(0));
        require(resturantToken.transferFrom(msg.sender,_tokens));
        deposit[_name]=_tokens;
        applicant[_name]=msg.sender;
        if(resturantQueue.first(category)==0 && resturantQueue.last(category)==0){
            resturantQueue.initializeQueue(category);
        }
        pendingResturants[_name]=Resturant(_name,_website,_location,_foodQuality,_service,_ambience);
        resturantQueue.enqueue(category,_name);
        return true;
    }
    
    function challengeApplication(uint _tokens,string memory _name) public returns(bool){
        require(challenger[_name] == address(0));
        require(msg.sender!=applicant[_name]);
        require(resturantToken.transferFrom(msg.sender,_tokens));
        require(_tokens >= deposit[_name]);
        challengerDeposit[_name]=_tokens;
        challenger[_name]=msg.sender;
        deadlineTime[_name]=now+500;
        return true;
    } 
    
    function vote(string memory _name,bool _state) public{
        require(now < deadlineTime[_name]);
        require(msg.sender != applicant[_name]);
        require(msg.sender != challenger[_name]);
        require(resturantToken.balanceOf(msg.sender)>0);
        require(alreadyVoted[_name][msg.sender] == false);
        alreadyVoted[_name][msg.sender]=true;
        if(_state == false){
            numVotesAgainst[_name]+=resturantToken.balanceOf(msg.sender);
            votersAgainst[_name].push(msg.sender);
        }
        else{
            numVotesFor[_name]+=resturantToken.balanceOf(msg.sender);
            votersFor[_name].push(msg.sender);
        }
    }
    
    function resolveVote() public {
        string memory _name=resturantQueue.getTop(category);
        require(now >= deadlineTime[_name]);
        require((numVotesFor[_name] > 0)||(numVotesAgainst[_name] > 0));
        if(numVotesFor[_name] > numVotesAgainst[_name]){
            require(resturantToken.transfer(applicant[_name],deposit[_name]));
            uint prize=challengerDeposit[_name];
            uint netWeight=numVotesFor[_name]+resturantToken.balanceOf(applicant[_name]);
            uint remaining=prize;
            uint share;
            uint i;
            for(i=0;i<votersFor[_name].length;i++){
                share=(resturantToken.balanceOf(votersFor[_name][i])*prize)/netWeight;
                remaining-=share;
                resturantToken.transfer(votersFor[_name][i],share);
                alreadyVoted[_name][votersFor[_name][i]]=false;
            }
            resturantToken.transfer(applicant[_name],remaining);
            for(i=0;i<votersAgainst[_name].length;i++){
                alreadyVoted[_name][votersAgainst[_name][i]]=false;
            }
            approvedResturants[_name]=pendingResturants[_name];
            approvedList.push(_name);
            lengthOfApprovedList++;
        }
        else if(numVotesAgainst[_name] > numVotesFor[_name] ){
            require(resturantToken.transfer(challenger[_name],challengerDeposit[_name]));
            uint prize=deposit[_name];
            uint netWeight=numVotesAgainst[_name]+resturantToken.balanceOf(challenger[_name]);
            uint remaining=prize;
            uint share;
            uint i;
            for(i=0;i<votersAgainst[_name].length;i++){
                share=(resturantToken.balanceOf(votersAgainst[_name][i])*prize)/netWeight;
                remaining-=share;
                resturantToken.transfer(votersAgainst[_name][i],share);
                alreadyVoted[_name][votersAgainst[_name][i]]=false;
            }
            resturantToken.transfer(challenger[_name],remaining);
            for(i=0;i<votersFor[_name].length;i++){
                alreadyVoted[_name][votersFor[_name][i]]=false;
            }
        }
        else{
            require(resturantToken.transfer(applicant[_name],deposit[_name]));
            require(resturantToken.transfer(challenger[_name],challengerDeposit[_name]));
            uint i;
            for(i=0;i<votersAgainst[_name].length;i++){
                alreadyVoted[_name][votersAgainst[_name][i]]=false;
            }
            for(i=0;i<votersFor[_name].length;i++){
                alreadyVoted[_name][votersFor[_name][i]]=false;
            }
        }
        alreadyVoted[_name][applicant[_name]]=false;
        alreadyVoted[_name][challenger[_name]]=false;
        delete applicant[_name];
        delete deposit[_name];
        delete challengerDeposit[_name];
        delete challenger[_name];
        delete numVotesFor[_name];
        delete numVotesAgainst[_name];
        delete votersFor[_name];
        delete votersAgainst[_name];
        delete deadlineTime[_name];
        delete pendingResturants[_name];
        resturantQueue.dequeue(category);
    }
}

// address: 0x50e0A5082EB50D9BD218Bcbd4292B70CE0A4C1d4