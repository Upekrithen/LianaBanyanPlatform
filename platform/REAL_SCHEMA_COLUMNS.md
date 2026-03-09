| table\_name          | column\_name         | data\_type                |

| ------------------- | ------------------- | ------------------------ |

| architect\_audit\_log | id                  | uuid                     |

| architect\_audit\_log | action              | text                     |

| architect\_audit\_log | details             | jsonb                    |

| architect\_audit\_log | ip\_address          | text                     |

| architect\_audit\_log | user\_agent          | text                     |

| architect\_audit\_log | timestamp           | timestamp with time zone |

| architect\_controls  | id                  | uuid                     |

| architect\_controls  | control\_key         | text                     |

| architect\_controls  | control\_value       | jsonb                    |

| architect\_controls  | description         | text                     |

| architect\_controls  | last\_modified\_by    | uuid                     |

| architect\_controls  | created\_at          | timestamp with time zone |

| architect\_controls  | updated\_at          | timestamp with time zone |

| article\_submissions | id                  | uuid                     |

| article\_submissions | article\_title       | text                     |

| article\_submissions | article\_file\_path   | text                     |

| article\_submissions | article\_type        | text                     |

| article\_submissions | publication\_name    | text                     |

| article\_submissions | publication\_email   | text                     |

| article\_submissions | editor\_name         | text                     |

| article\_submissions | submission\_url      | text                     |

| article\_submissions | status              | text                     |

| article\_submissions | submitted\_at        | timestamp with time zone |

| article\_submissions | response\_at         | timestamp with time zone |

| article\_submissions | published\_at        | timestamp with time zone |

| article\_submissions | published\_url       | text                     |

| article\_submissions | rejection\_reason    | text                     |

| article\_submissions | retry\_after         | timestamp with time zone |

| article\_submissions | credits\_pledged     | integer                  |

| article\_submissions | golden\_key          | text                     |

| article\_submissions | joule\_multiplier    | numeric                  |

| article\_submissions | created\_at          | timestamp with time zone |

| article\_submissions | updated\_at          | timestamp with time zone |

| article\_submissions | priority            | integer                  |

| article\_submissions | scheduled\_for       | timestamp with time zone |

| article\_submissions | contact\_email       | text                     |

| article\_submissions | follow\_up\_date      | date                     |

| automation\_log      | id                  | uuid                     |

| automation\_log      | action              | text                     |

| automation\_log      | details             | jsonb                    |

| automation\_log      | created\_at          | timestamp with time zone |

| bond\_accounts       | id                  | uuid                     |

| bond\_accounts       | user\_id             | uuid                     |

| bond\_accounts       | total\_joules        | numeric                  |

| bond\_accounts       | locked\_joules       | numeric                  |

| bond\_accounts       | available\_joules    | numeric                  |

| bond\_accounts       | marks\_generated     | numeric                  |

| bond\_accounts       | created\_at          | timestamp with time zone |

| bond\_accounts       | updated\_at          | timestamp with time zone |

| bond\_allocations    | id                  | uuid                     |

| bond\_allocations    | bond\_account\_id     | uuid                     |

| bond\_allocations    | bounty\_id           | uuid                     |

| bond\_allocations    | contract\_id         | uuid                     |

| bond\_allocations    | purpose             | character varying        |

| bond\_allocations    | joules\_locked       | numeric                  |

| bond\_allocations    | marks\_generated     | numeric                  |

| bond\_allocations    | status              | character varying        |

| bond\_allocations    | lock\_until          | timestamp with time zone |

| bond\_allocations    | released\_at         | timestamp with time zone |

| bond\_allocations    | release\_reason      | character varying        |

| bond\_allocations    | created\_at          | timestamp with time zone |

| bounty\_claims       | id                  | uuid                     |

| bounty\_claims       | user\_id             | uuid                     |

| bounty\_claims       | bounty\_id           | uuid                     |

| bounty\_claims       | status              | character varying        |

| bounty\_claims       | created\_at          | timestamp with time zone |

| bracket\_standings   | id                  | uuid                     |

| bracket\_standings   | sponsor\_id          | uuid                     |

| bracket\_standings   | season              | character varying        |

| bracket\_standings   | total\_score         | numeric                  |

| bracket\_standings   | members\_drafted     | integer                  |

| bracket\_standings   | members\_active      | integer                  |

| bracket\_standings   | bonus\_points        | numeric                  |

| bracket\_standings   | current\_rank        | integer                  |

| bracket\_standings   | previous\_rank       | integer                  |

| bracket\_standings   | achievements        | jsonb                    |

| bracket\_standings   | created\_at          | timestamp with time zone |

| bracket\_standings   | updated\_at          | timestamp with time zone |

| brass\_tacks\_claims  | id                  | uuid                     |

| brass\_tacks\_claims  | offer\_id            | uuid                     |

| brass\_tacks\_claims  | email               | character varying        |

| brass\_tacks\_claims  | user\_id             | uuid                     |

| brass\_tacks\_claims  | claim\_status        | character varying        |

| brass\_tacks\_claims  | confirmed\_at        | timestamp with time zone |

| brass\_tacks\_claims  | membership\_created  | boolean                  |

| brass\_tacks\_claims  | membership\_id       | uuid                     |

| brass\_tacks\_claims  | created\_at          | timestamp with time zone |

| bulk\_donations      | id                  | uuid                     |

| bulk\_donations      | company\_name        | text                     |

| bulk\_donations      | contact\_name        | text                     |

| bulk\_donations      | contact\_email       | text                     |

| bulk\_donations      | contact\_phone       | text                     |

| bulk\_donations      | company\_website     | text                     |

| bulk\_donations      | product\_name        | text                     |

| bulk\_donations      | product\_description | text                     |

| bulk\_donations      | product\_image\_url   | text                     |

| bulk\_donations      | product\_value       | numeric                  |

| bulk\_donations      | quantity            | integer                  |

| bulk\_donations      | total\_value         | numeric                  |

| bulk\_donations      | ships\_from          | text                     |

