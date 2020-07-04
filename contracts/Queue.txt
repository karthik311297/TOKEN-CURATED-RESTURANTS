// SPDX-License-Identifier: UNLICENCED
pragma solidity >=0.6.6 <0.7.0;
contract Queue{
    
    mapping (string => uint) public first;
    
    mapping (string => uint) public last;
    
    mapping (string => mapping (uint => string)) queue;
    
    
    function getTop(string memory _category)public view returns(string memory){
        return queue[_category][first[_category]];
    }
    
    function initializeQueue(string memory _category)public{
        first[_category]=1;
        last[_category]=0;
    }
    
    function enqueue(string memory _category,string memory _item) public {
        last[_category] += 1;
        queue[_category][last[_category]]=_item;
    }
    
    function dequeue(string memory _category) public  {
        require(last[_category] >= first[_category]);  // non-empty queue

        delete queue[_category][first[_category]];
        
        first[_category] += 1;
        
    }
}

//address: 0xB41AB43c81A3b4FB8C847cb0AEF2ea567b018a07